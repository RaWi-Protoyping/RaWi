from typing import Text, List
import pandas as pd
from langdetect import detect_langs
from collections import Counter


class Filter(object):

    def __init__(self, app_meta_data_path: Text, app_ui_details_path: Text):
        self.app_meta_data = pd.read_csv(app_meta_data_path)
        self.app_ui_details = pd.read_csv(app_ui_details_path)

    def filter_categories(self, file_name: Text) -> bool:
        filtered_categories = ['Entertainment']
        ui_number = int(file_name.split('.')[0])
        package_name = self.app_ui_details.loc[self.app_ui_details['UI Number'] == \
                                         ui_number]['App Package Name'].tolist()[0]
        category = self.app_meta_data.loc[self.app_meta_data['App Package Name'] == \
                                          package_name]['Category'].tolist()[0]
        return (category in filtered_categories)

    def filter_ads(self, component_labels: List[Text]) -> bool:
        if len(component_labels) == 0:
            return True
        else:
            counts = Counter(component_labels)
            keys = set(counts.keys())
            print(counts)
            if len(keys) == 1 and 'Web View' in keys:
                return True
            elif len(keys) == 2 and ('Web View' in keys) and ('Icon' in keys):
                return True
            elif len(keys) == 2 and ('Web View' in keys) and ('Advertisement' in keys):
                return True
            else:
                return False

    def filter_langs(self, text: Text) -> bool:
        try:
            lang = detect_langs(text)
            return max(lang, key=lambda x: x.prob).lang != 'en'
        except:
            return False