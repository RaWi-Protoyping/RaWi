from typing import Text, Generator, Tuple, List, Optional, Dict, Set
from jsonpath_ng import parse
import json, os, re
import gui2r.utils as utils
from gui2r.preprocessing.preprocess import Preprocessor
from gui2r.retrieval.configuration.conf import Configuration
from json2xml import json2xml
import pandas as pd
import functools
from ast import literal_eval
from parsel import Selector
from gui2r.preprocessing.filter import Filter
import wordninja

import logging

logging.getLogger().setLevel(logging.INFO)
logging.getLogger('dicttoxml').setLevel(logging.WARNING)


class Extractor(object):

    # Pattern to extract visible text
    JSONPATH_EXPR_TEXT = parse('$..text')
    JSONPATH_EXPR_TEXT_VISIBILITY = parse('$..text.`parent`.visibility')
    JSONPATH_EXPR_TEXT_VIS_TO_USER = parse('$..text.`parent`.visible-to-user')
    # Pattern to extract non-visible text hints
    JSONPATH_EXPR_TEXT_HINT = parse('$..text-hint')
    JSONPATH_EXPR_ACTIVITY_NAME = parse('$..activity_name')
    # Pattern to extract resource-ids
    JSONPATH_EXPR_RESOURCE_IDS = parse('$..resource-id')
    # Pattern to extract visible-to-user
    JSONPASTH_EXPR_VIS_TO_USER = parse('$..resource-id.`parent`.visible-to-user')
    # Pattern to extract class names
    JSONPATH_EXPR_CLASS = parse('$..class')


    DATA_ACTIVITY_NAME = 'activity_name'
    DATA_TEXT_VISIBLE = 'text-visible'
    DATA_TEXT_INVISIBLE = 'text-invisible'
    DATA_RES_IDS_VISIBLE = 'res-ids-visible'
    DATA_RES_IDS_INVISIBLE = 'res-ids-invisible'
    DATA_ICON_IDS = 'icon-ids'
    DATA_ALL = 'text-all'
    DATA_BUTTON_TEXT = 'button-text'

    stop_words_r_ids = {'main', 'content', 'navigation', 'bar', 'background', 'status',
                        'checkbox', 'widget', 'frame', 'container', 'action', 'btn', 'menu',
                        'label', 'root', 'toolbar', 'view', 'button', 'activity', 'layout',
                        'drawer', 'actionbar', 'icon', 'text', 'banner'}

    def __init__(self, preprocessor: Optional[Preprocessor] = Preprocessor()):
        self.preprocessor = preprocessor
        self.xml_parse_errors = 0
        self.file_count = 0
        self.filter_count = 0
        self.filter_count_cat = 0
        self.filter_lang_count = 0
        self.filter_ads_count = 0

    @functools.lru_cache(maxsize=None)
    def load_dataset(self, conf: Configuration, force: Optional[bool] = False) -> pd.DataFrame:
        preproc_dataset_path = conf.path_preproc_text + 'dataset_' + conf.get_desc_dataset() + '.csv'
        filter = Filter(app_meta_data_path=conf.path_app_details,
                        app_ui_details_path=conf.path_ui_details)
        if force or (not os.path.isfile(preproc_dataset_path)):
            logging.info('TextExtraction: Creating dataset for : {}'.format(conf.get_desc_dataset()))
            test = [[filename, data[Extractor.DATA_ACTIVITY_NAME],
                     data[Extractor.DATA_TEXT_VISIBLE],
                     data[Extractor.DATA_TEXT_INVISIBLE],
                     data[Extractor.DATA_RES_IDS_VISIBLE],
                     data[Extractor.DATA_RES_IDS_INVISIBLE],
                     data[Extractor.DATA_ICON_IDS],
                     self.all_text(data, conf)] for (filename, data) in
                     self.text_extraction(conf.path_dsls, conf.path_semantic, conf, filter)]
            dataframe = pd.DataFrame(data=test, columns=['filename', Extractor.DATA_ACTIVITY_NAME,
                                                         Extractor.DATA_TEXT_VISIBLE, Extractor.DATA_TEXT_INVISIBLE,
                                                         Extractor.DATA_RES_IDS_VISIBLE, Extractor.DATA_RES_IDS_INVISIBLE,
                                                         Extractor.DATA_ICON_IDS, Extractor.DATA_ALL])
            dataframe.to_csv(path_or_buf=preproc_dataset_path)
            self.print_filter_report()
            return dataframe
        else:
            logging.info('TextExtraction: Loading cached dataset for : {}'.format(conf.get_desc_dataset()))
            dataset = pd.read_csv(preproc_dataset_path)
            dataset.loc[:, Extractor.DATA_ACTIVITY_NAME] = dataset.loc[:, Extractor.DATA_ACTIVITY_NAME].apply(lambda x: literal_eval(x))
            dataset.loc[:, Extractor.DATA_TEXT_VISIBLE] = dataset.loc[:, Extractor.DATA_TEXT_VISIBLE].apply(lambda x: literal_eval(x))
            dataset.loc[:, Extractor.DATA_TEXT_INVISIBLE] = dataset.loc[:, Extractor.DATA_TEXT_INVISIBLE].apply(lambda x: literal_eval(x))
            dataset.loc[:, Extractor.DATA_RES_IDS_VISIBLE] = dataset.loc[:, Extractor.DATA_RES_IDS_VISIBLE].apply(lambda x: literal_eval(x))
            dataset.loc[:, Extractor.DATA_RES_IDS_INVISIBLE] = dataset.loc[:, Extractor.DATA_RES_IDS_INVISIBLE].apply(lambda x: literal_eval(x))
            dataset.loc[:, Extractor.DATA_ICON_IDS] = dataset.loc[:, Extractor.DATA_ICON_IDS].apply(lambda x: literal_eval(x))
            dataset.loc[:, Extractor.DATA_ALL] = dataset.loc[:, Extractor.DATA_ALL].apply(lambda x: literal_eval(x))
            return dataset

    def all_text(self, data: Dict[Text, List[Text]], conf: Configuration):
        if conf.tokenized:
            return data[Extractor.DATA_ACTIVITY_NAME] + \
                          data[Extractor.DATA_TEXT_VISIBLE] + \
                          data[Extractor.DATA_TEXT_INVISIBLE] + \
                          data[Extractor.DATA_RES_IDS_VISIBLE] + \
                          data[Extractor.DATA_RES_IDS_INVISIBLE] + \
                          data[Extractor.DATA_ICON_IDS]
        else:
            return data[Extractor.DATA_ACTIVITY_NAME] + ' ' + \
                   data[Extractor.DATA_TEXT_VISIBLE] + ' ' + \
                   data[Extractor.DATA_TEXT_INVISIBLE] + ' ' + \
                   data[Extractor.DATA_RES_IDS_VISIBLE] + ' ' + \
                   data[Extractor.DATA_RES_IDS_INVISIBLE] + ' ' + \
                   data[Extractor.DATA_ICON_IDS]

    def text_extraction(self, in_path_combined: Text, in_path_semantic: Text,
                        conf: Configuration, filter: Filter) -> Generator[Tuple[Text, Dict[Text, List[Text]]], None, None]:
        for file_name in utils.iter_files_in_dir(in_path_combined, ending='.json'):
            data = self.text_extraction_from_file(in_path_combined, in_path_semantic, file_name, conf, filter)
            logging.info('File : {}, Data : {}'.format(os.path.basename(file_name), data))
            if data:
                self.file_count += 1
                yield os.path.basename(file_name), data
            else:
                self.filter_count += 1

    def text_extraction_from_file(self, file_path_combined: Text, file_path_semantic: Text,
                                  file_name: Text,
                                  conf: Configuration,
                                  filter: Filter) -> Dict[Text, List[Text]]:
            if conf.filter_guis:
                filter_cat = filter.filter_categories(file_name)
                if filter_cat:
                    self.filter_count_cat += 1
                    return None
            with open(file_path_combined + file_name, 'r', encoding='utf8') as file_1:
                ui_json_combined = json.load(file_1)
                with open(file_path_semantic + file_name, 'r', encoding='utf8') as file_2:
                    ui_json_semantic = json.load(file_2)
                    try:
                        ui_xml_semantic = json2xml.Json2xml(ui_json_semantic).to_xml()
                        selector_semantic = Selector(text=ui_xml_semantic)
                        icon_ids = selector_semantic.xpath('//iconclass/text()').getall()
                        icon_ids = [elem for icon_id in icon_ids for elem in Extractor.snake_case_split(icon_id)]
                        component_labels = selector_semantic.xpath('//componentlabel/text()').getall()
                        if conf.filter_guis:
                            print(component_labels)
                            filter_ads = filter.filter_ads(component_labels)
                            print('filter_ads : {}'.format(filter_ads))
                            if filter_ads:
                                self.filter_ads_count += 1
                                return None
                    except:
                        self.xml_parse_errors += 1
                        icon_ids = [""]
                ui_activity_name = Extractor.extract_activity_name(ui_json_combined)
                ui_text_visible, ui_text_invisible = Extractor.extract_visible_text(ui_json_combined)
                ui_text_hint_invisible = Extractor.extract_invisible_hint_text(ui_json_combined)
                ui_text_invisible = ui_text_invisible + ui_text_hint_invisible
                ui_res_ids_visible, ui_res_ids_invisible = Extractor.extract_resource_ids(ui_json_combined)
                ui_res_ids_norm_visible = self.preprocessor.detokenizer.detokenize([self.preprocessor.detokenizer.detokenize(
                    Extractor.normalize_resource_id(r_id)) for r_id in ui_res_ids_visible])
                ui_res_ids_norm_invisible = self.preprocessor.detokenizer.detokenize(
                    [self.preprocessor.detokenizer.detokenize(
                        Extractor.normalize_resource_id(r_id)) for r_id in ui_res_ids_invisible])
                ui_activity_name = self.preprocessor.detokenizer.detokenize(ui_activity_name)
                ui_text_visible = self.preprocessor.detokenizer.detokenize(ui_text_visible)
                ui_text_invisible = self.preprocessor.detokenizer.detokenize(ui_text_invisible)
                # Filter the GUI if the language is not english. However, we check language only
                # when we have at least ten tokens in the visible text, otherwise the language
                # detection is too error-prone and needs longer text. We rather include a non-english
                # GUI in the result set then exclude a wrongly classified english GUI
                if conf.filter_guis:
                    ui_text_visible_tokens = self.preprocessor.tokenizer.tokenize(ui_text_visible)
                    ui_text_invisible_tokens = self.preprocessor.tokenizer.tokenize(ui_text_invisible)
                    ui_text_lang_all = ui_text_visible_tokens + ui_text_invisible_tokens
                    num_token_ui_lang_all = len(ui_text_lang_all)
                    filter_lang = False if num_token_ui_lang_all < 10 else filter.filter_langs(ui_text_lang_all)
                    if filter_lang:
                        self.filter_lang_count += 1
                        return None
                icon_ids = self.preprocessor.detokenizer.detokenize(icon_ids)
                data = {
                    Extractor.DATA_ACTIVITY_NAME: self.preprocessor.preprocess_text(ui_activity_name,
                                            tokenized=True,
                                            remove_stopwords=conf.preprocesing_rm_stopwords,
                                            stemmed=conf.preprocesing_stemmed,
                                            stemming=conf.preprocessing_stemmer),
                    Extractor.DATA_TEXT_VISIBLE: self.preprocessor.preprocess_text(ui_text_visible,
                                            tokenized=True,
                                            remove_stopwords=conf.preprocesing_rm_stopwords,
                                            stemmed=conf.preprocesing_stemmed,
                                            stemming=conf.preprocessing_stemmer),
                    Extractor.DATA_TEXT_INVISIBLE: self.preprocessor.preprocess_text(ui_text_invisible,
                                            tokenized=True,
                                            remove_stopwords=conf.preprocesing_rm_stopwords,
                                            stemmed=conf.preprocesing_stemmed,
                                            stemming=conf.preprocessing_stemmer),
                    Extractor.DATA_RES_IDS_VISIBLE: self.preprocessor.preprocess_text(ui_res_ids_norm_visible,
                                            tokenized=True,
                                            remove_stopwords=conf.preprocesing_rm_stopwords,
                                            stemmed=conf.preprocesing_stemmed,
                                            stemming=conf.preprocessing_stemmer),
                    Extractor.DATA_RES_IDS_INVISIBLE: self.preprocessor.preprocess_text(ui_res_ids_norm_invisible,
                                            tokenized=True,
                                            remove_stopwords=conf.preprocesing_rm_stopwords,
                                            stemmed=conf.preprocesing_stemmed,
                                            stemming=conf.preprocessing_stemmer),
                    Extractor.DATA_ICON_IDS: self.preprocessor.preprocess_text(icon_ids,
                                            tokenized=True,
                                            remove_stopwords=conf.preprocesing_rm_stopwords,
                                            stemmed=conf.preprocesing_stemmed,
                                            stemming=conf.preprocessing_stemmer)
                }
            return data

    def print_filter_report(self):
        return '#Files: {}, #Filtered: {}, #Filter-Cat: {}, Filter-Lang: {}, Filter-Ads: {}'.\
            format(self.file_count, self.filter_count, self.filter_count_cat, self.filter_lang_count, self.filter_ads_count)

    @staticmethod
    def extract_visible_text(ui_description: Text) -> Tuple[List[Text], List[Text]]:
        results_text_visible = []
        results_text_invisible = []
        for (m1, m2) in zip(Extractor.JSONPATH_EXPR_TEXT.find(ui_description),
                            Extractor.JSONPATH_EXPR_TEXT_VIS_TO_USER.find(ui_description)):
            if m1.value:
                if m2.value: results_text_visible.append(m1.value)
                else: results_text_invisible.append(m1.value)
        return results_text_visible, results_text_invisible

    @staticmethod
    def extract_resource_ids(ui_description: Text) -> Tuple[List[Text], List[Text]]:
        res_ids_visible = []
        res_ids_invisible = []
        for (m1, m2) in zip(Extractor.JSONPATH_EXPR_RESOURCE_IDS.find(ui_description),
                            Extractor.JSONPASTH_EXPR_VIS_TO_USER.find(ui_description)):
            if m1.value:
                if m2.value: res_ids_visible.append(m1.value)
                else: res_ids_invisible.append(m1.value)
        return res_ids_visible, res_ids_invisible

    @staticmethod
    def extract_button_text(ui_description: Text, visible: Optional[bool] = True) -> List[Text]:
        JSONPATH_EXPR_BUTTON = parse('$..[?"resource-id"="com.fitradio:id/facebook_login_button"]')
        results_text = [match.value for match in JSONPATH_EXPR_BUTTON.find(ui_description)]
        return results_text


    @staticmethod
    def extract_invisible_hint_text(ui_description: Text) -> List[Text]:
        results_text_hint = [match.value for match in
                             Extractor.JSONPATH_EXPR_TEXT_HINT.find(ui_description)]
        return results_text_hint

    @staticmethod
    def extract_activity_name(ui_description: Text) -> List[Text]:
        results_activity_name = [match.value for match in
                                 Extractor.JSONPATH_EXPR_ACTIVITY_NAME.find(ui_description)]
        activity_name = results_activity_name[0]
        activity_name = Extractor.normalize_activity_name_2(activity_name, filter_tokens=['Activity', 'Activities', 'Main', 'com',
                                                                                          'app', 'activity', 'ui', 'popup', 'view',
                                                                                          'master', 'android', 'activities', 'main',
                                                                                          'org', 'de'])
        return activity_name

    @staticmethod
    def normalize_activity_name(activity_name: Text, filter_tokens: List[Text]) -> List[Text]:
        parts = activity_name.split('.')
        class_name = parts[len(parts)-1]
        tokens = Extractor.camel_case_split(class_name)
        filtered_words = [token for token in tokens if token not in filter_tokens]
        return filtered_words

    @staticmethod
    def normalize_activity_name_2(activity_name: Text, filter_tokens: List[Text]) -> List[Text]:
        tokens = Extractor.snake_camel_case_prob_split_activity(activity_name)
        filtered_words = [token.lower() for token in tokens if token.lower() not in filter_tokens and not len(token)<=1]
        unique_tokens = list(set(filtered_words))
        return unique_tokens

    @staticmethod
    def normalize_resource_id(resource_id: Text, filter_tokens: Optional[Set[Text]] = None) -> List[Text]:
        stopwords = filter_tokens if filter_tokens else Extractor.stop_words_r_ids
        name_split = resource_id.split('/')
        name = name_split[len(name_split)-1]
        norm_name = [token for token in Extractor.snake_camel_case_split(name) if token.lower() not in stopwords]
        return norm_name

    @staticmethod
    def camel_case_split(identifier: Text) -> List[Text]:
        matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', identifier)
        return [m.group(0) for m in matches]

    @staticmethod
    def snake_case_split(identifier: Text) -> List[Text]:
        return identifier.split('_')

    @staticmethod
    def snake_camel_case_split(identifier: Text) -> List[Text]:
        snake_cases = Extractor.snake_case_split(identifier)
        splits = [cc for sc in snake_cases
                  for cc in Extractor.camel_case_split(sc)]
        return splits

    @staticmethod
    def snake_camel_case_prob_split(identifier: Text) -> List[Text]:
        # First snake case splitting
        snake_cases = Extractor.snake_case_split(identifier)
        # On each snake case splits, apply camel case splitting
        camel_snake_splits = [cc for sc in snake_cases
                  for cc in Extractor.camel_case_split(sc)]
        # On the resulting splits, we finally apply prob splitting
        cample_snake_prob_splits = [cc for sc in camel_snake_splits
                                    for cc in wordninja.split(sc)]
        return cample_snake_prob_splits

    @staticmethod
    def snake_camel_case_prob_split_activity(identifier: Text) -> List[Text]:
        slash_split = identifier.split('/')
        tokens = [token for split in slash_split for token in split.split('.')]
        # First snake case splitting
        snake_cases = [sc for sc in tokens for cc in Extractor.snake_case_split(sc)]
        # On each snake case splits, apply camel case splitting
        camel_snake_splits = [cc for sc in snake_cases
                  for cc in Extractor.camel_case_split(sc)]
        # On the resulting splits, we finally apply prob splitting
        cample_snake_prob_splits = [cc for sc in camel_snake_splits
                                    for cc in wordninja.split(sc)]
        return cample_snake_prob_splits