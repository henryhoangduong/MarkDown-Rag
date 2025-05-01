from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


class EmbeddingManager:
    def __init__(
        self,
        documents,
        persist_directory,
        model_name="mixedbread-ai/mxbai-embed-large-v1",
    ):
        self.documents = documents
        self.persist_directory = persist_directory
        self.vectordb = None
        self.model_name = model_name

    # Method to create and persist embeddings
    def create_and_persist_embeddings(self):
        embedding = HuggingFaceEmbeddings(model_name=self.model_name)
        self.vectordb = Chroma.from_documents(
            documents=self.documents,
            embedding=embedding,
            persist_directory=self.persist_directory,
        )
        self.vectordb.persist()
