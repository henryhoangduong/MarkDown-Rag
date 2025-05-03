import os
import shutil
from typing import Annotated

from fastapi import FastAPI, File, UploadFile

from utils.MarkDownUtils import ChunkByMarkdown, ConvertToMarkdown, ConvertDftoDocument
from EmbeddingManager import EmbeddingManager
from pathlib import Path

app = FastAPI()


@app.post("/files/")
async def create_file(file: Annotated[UploadFile, File()]):
    save_dir = "data"
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, file.filename)
    filenname_without_ext = os.path.splitext(file.filename)[0]
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # converting to markdown
    markdown_convert_res = await ConvertToMarkdown(file_path)

    # Chunk by heading
    chunk_df =await ChunkByMarkdown(fpath=f"markdown/{filenname_without_ext}/{filenname_without_ext}.md")

    # Convert to langchain document
    documents =await ConvertDftoDocument(chunk_df)

    # vectorize
    manager = EmbeddingManager(documents=documents, persist_directory=f"vector_db/{file.filename}")
    await manager.create_and_persist_embeddings()

    return {"filename": file.filename, "saved_to": file_path}


@app.get("/files/")
async def get_files():
    folder_path = Path('data')
    file_names = [{"name":f.name} for f in folder_path.iterdir() if f.is_file()]
    return file_names


@app.get("/")
async def root():
    return {"message": "Hello World"}
