from typing import Text, Optional, Generator
import os, re


def extract_text_from_file(file_path: Text) -> Text:
    with open(file_path, mode='r') as file:
        text = file.read()
    return text


def iter_files_in_dir(path: Text, ending: Optional[Text] = None) \
        -> Generator[Text, None, None]:
    fin_path = os.path.join(os.path.dirname(__file__), path)
    for file_name in sorted_alphanumeric(os.listdir(path=fin_path)):
        if ending:
            if file_name.endswith(ending):
                yield file_name
        else:
            yield file_name


def sorted_alphanumeric(data):
    convert = lambda text: int(text) if text.isdigit() else text.lower()
    alphanum_key = lambda key: [ convert(c) for c in re.split('([0-9]+)', key) ]
    return sorted(data, key=alphanum_key)


def mk_dir_if_not_exists(path: Text) -> None:
    if not os.path.exists(path):
            os.makedirs(path)