import os
import time

import click
from marker.config.parser import ConfigParser
from marker.config.printer import CustomClickPrinter
from marker.logger import configure_logging
from marker.models import create_model_dict
from marker.output import save_output
from pathlib import Path


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
            config_parser.get_base_filename(
                "/data/Lecture-6-Công-nghệ-học-không-giám-sát.pdf"
            ),
        )
        print(f"Saved markdown to {out_folder}")
        print(f"Total time: {time.time() - start}")
        return True
    except Exception as e:
        print("Error converting markdown: ", e)
        return False
