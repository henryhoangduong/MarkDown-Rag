import ast
import os
import re
import time
from pathlib import Path

import click
import mistletoe
import pandas as pd
from langchain.schema import Document
from marker.config.parser import ConfigParser
from marker.config.printer import CustomClickPrinter
from marker.logger import configure_logging
from marker.models import create_model_dict
from marker.output import save_output
from mistletoe import HTMLRenderer
from mistletoe.latex_renderer import LaTeXRenderer


# Convert file to Markdown
async def ConvertToMarkdown(fpath: str):
    if not Path(fpath).is_file():
        raise FileNotFoundError(f"File not found at path: {fpath}")

    try:
        models = create_model_dict()
        start = time.time()
        config_parser = ConfigParser(
            {"output_dir": "markdown", "output_format": "markdown"}
        )

        converter_cls = config_parser.get_converter_cls()
        converter = converter_cls(
            config=config_parser.generate_config_dict(),
            artifact_dict=models,
            processor_list=config_parser.get_processors(),
            renderer=config_parser.get_renderer(),
            llm_service=config_parser.get_llm_service(),
        )
        rendered = converter(fpath)
        out_folder = config_parser.get_output_folder(fpath)
        save_output(
            rendered,
            out_folder,
            config_parser.get_base_filename(fpath),
        )
        print(f"Saved markdown to {out_folder}")
        print(f"Total time: {time.time() - start}")
        return True
    except Exception as e:
        print("Error converting markdown: ", e)
        return False
    
# Chunk markdown file by title and return as dataframe
async def ChunkByMarkdown(fpath:str):
    print(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    document = mistletoe.Document(content)

    rows = []
    current_chapter = None
    current_heading = None
    current_level = None
    buffer = []
    def extract_text(node):
        if hasattr(node, 'content'):
            return node.content
        elif hasattr(node, 'children'):
            return ''.join(extract_text(child) for child in node.children)
        else:
            return ''

    # Extract math formula
    def extract_math(text):
        pattern = r"(\$\$.*?\$\$|\$.*?\$)"
        return re.findall(pattern, text, flags=re.DOTALL)

    def save_buffer():
        if current_heading:
            combined_text = "\n".join(buffer).strip()
            math_found = extract_math(combined_text)
            rows.append({
                "chapter_title": current_chapter,
                "heading_text": current_heading,
                "heading_level": current_level,
                "content": combined_text,
                "math_formula": math_found if math_found else None
            })

    for node in document.children:
        if node.__class__.__name__ == 'Heading':
            if node.level == 1:  # #
                if current_heading:
                    save_buffer()
                current_chapter = extract_text(node)  # <-- changed here!
                current_heading = None
                buffer = []
            elif node.level > 1 and current_chapter:
                if current_heading:
                    save_buffer()
                try:
                    current_heading =node.children[0].content
                except Exception as e:
                    print(f"Error chunking by markdown: {e}")
                current_level = node.level
                buffer = []
        elif current_heading:
            if hasattr(node, 'children'):
                text = ''.join(child.content for child in node.children if hasattr(child, 'content'))
                if text.strip():
                    buffer.append(text)

    if current_heading:
        save_buffer()

    df = pd.DataFrame(rows)

    return df

async def ConvertDftoDocument(df):
    documents = []

    for _, row in df.iterrows():
        content_text = row['content'] if pd.notna(row['content']) else ""

        # Safely handle math_formula
        math_formula = ""
        if pd.notna(row['math_formula']):
            try:
                math_formula_list = ast.literal_eval(row['math_formula'])
                if isinstance(math_formula_list, list):
                    math_formula = ", ".join(str(item) for item in math_formula_list)  # convert list to comma-separated string
                else:
                    math_formula = str(math_formula_list)  # fallback to string
            except (ValueError, SyntaxError):
                math_formula = ""

        metadata = {
            "chapter_title": row['chapter_title'],
            "heading_text": row['heading_text'],
            "heading_level": int(row['heading_level']) if pd.notna(row['heading_level']) else -1,  # ensure int
            "math_formula": math_formula,  # string, not list
        }

        doc = Document(
            page_content=content_text,
            metadata=metadata,
        )
        documents.append(doc) 
    return documents
