from fastapi import FastAPI
from fastapi import FastAPI, File, UploadFile
from typing import Annotated
import os
import shutil

app = FastAPI()

@app.post("/files/")
async def create_file(file: Annotated[UploadFile, File()]):
    save_dir = "data"
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename, "saved_to": file_path}

@app.get("/")
async def root():
    return {"message": "Hello World"}
