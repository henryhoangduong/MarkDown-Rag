import os
import shutil
from pathlib import Path
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Body, FastAPI, File, HTTPException, Request, UploadFile
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings

from EmbeddingManager import EmbeddingManager
from utils.MarkDownUtils import (ChunkByMarkdown, ConvertDftoDocument,
                                 ConvertToMarkdown)

load_dotenv()
app = FastAPI()

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash", api_key=os.getenv("GOOGLE_API_KEY")
)

@app.post("/files")
async def create_file(file: Annotated[UploadFile, File()]):
    save_dir = "data"
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, file.filename)
    filenname_without_ext = os.path.splitext(file.filename)[0]
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # converting to markdown
    if not os.path.isdir(f"markdown/{filenname_without_ext}"):
        markdown_convert_res = await ConvertToMarkdown(file_path)

    # Chunk by heading
    chunk_df = await ChunkByMarkdown(
        fpath=f"markdown/{filenname_without_ext}/{filenname_without_ext}.md"
    )

    # Convert to langchain document
    documents = await ConvertDftoDocument(chunk_df)

    # vectorize
    manager = EmbeddingManager(
        documents=documents, persist_directory=f"vector_db/{filenname_without_ext}"
    )
    await manager.create_and_persist_embeddings()

    return {"filename": file.filename, "saved_to": file_path}


@app.get("/files/")
async def get_files():
    folder_path = Path("data")
    file_names = [{"name": f.name} for f in folder_path.iterdir() if f.is_file()]
    return file_names


@app.post("/chat/files/{file_name}")
async def get_files(file_name: str, req: Request):
    filename_without_ext = os.path.splitext(file_name)[0]
    vector_path = f"vector_db/{filename_without_ext}"
    body = await req.json()
    message = body.get("message")

    # Check if vector exists
    if(not os.path.isdir(vector_path)):
        raise HTTPException(status_code=404, detail=f"Vector directory '{vector_path}' not found")

    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use the retrieved context information, not your internal knowledge."
        "If the context retrieval is not provided, say that the document is not provided.ftit"
        "\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )

    vectorstore = Chroma(
        persist_directory=vector_path,
        embedding_function=HuggingFaceEmbeddings(
            model_name="mixedbread-ai/mxbai-embed-large-v1"
        ),
    )
    retriever = vectorstore.as_retriever()
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    retrieved_docs = retriever.invoke(message)
    context = "\n".join([doc.page_content for doc in retrieved_docs])
    input_data = {
                "input": message,
                "context": context,
            }
    answer = rag_chain.invoke(input_data)

    return {"response": answer}
