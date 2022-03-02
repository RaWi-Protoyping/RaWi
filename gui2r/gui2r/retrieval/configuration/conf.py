from typing import Text, Optional, List
from gui2r.preprocessing.preprocess import Stemming

class Configuration():

    def __init__(self, path_guis: Optional[Text] = '../../resources/combined_small/',
                 path_dsls: Optional[Text] = '../../resources/combined_small/',
                 path_semantic: Optional[Text] = '../../resources/semantic_annotations',
                 path_preproc_text: Optional[Text] = '../../resources/preprocessed_text_small/',
                 path_app_details: Optional[Text] = '../../resources/app_details.csv',
                 path_ui_details : Optional[Text] = '../../resources/ui_details.csv',
                 path_models: Optional[Text] = '/models',
                 path_ui_comp_models: Optional[Text] = '/models/ui_comps/',
                 threshold: Optional[float] = 0.0,
                 tokenized: Optional[bool] = True,
                 preprocessing_stemmed: Optional[bool] = False,
                 preprocessing_stemmer: Optional[Text] = Stemming.KROVETZ,
                 preprocessing_rm_stopwords: Optional[bool] = True,
                 filter_guis: Optional[bool] = False,
                 dir_name_prefix: Optional[Text] = '',
                 text_segments_used: Optional[List[Text]] = None):
        self.path_guis = path_guis
        self.path_dsls = path_dsls
        self.path_semantic = path_semantic
        self.path_preproc_text = path_preproc_text
        self.path_app_details = path_app_details
        self.path_ui_details = path_ui_details
        self.path_models = path_models
        self.path_ui_comp_models = path_ui_comp_models
        self.threshold = threshold
        self.tokenized = tokenized
        self.preprocesing_stemmed = preprocessing_stemmed
        self.preprocessing_stemmer = preprocessing_stemmer
        self.preprocesing_rm_stopwords = preprocessing_rm_stopwords
        self.filter_guis = filter_guis
        self.dir_name_prefix = dir_name_prefix
        if not text_segments_used:
            text_segments_used = ['text-all']
        self.text_segments_used = text_segments_used

    def get_desc(self) -> Text:
        desc = self.dir_name_prefix
        desc = desc + ('_stem_T'+self.preprocessing_stemmer) if self.preprocesing_stemmed else desc + '_stem_F'
        desc = desc + '_stpw_T' if self.preprocesing_rm_stopwords else desc + '_stpw_F'
        desc = desc + '_filter_T' if self.filter_guis else desc + '_filter_F'
        desc = desc + '_uts_' + '_'.join(self.text_segments_used)
        return desc

    def get_desc_dataset(self) -> Text:
        desc = self.dir_name_prefix
        desc = desc + ('_stem_T'+self.preprocessing_stemmer) if self.preprocesing_stemmed else desc + '_stem_F'
        desc = desc + '_stpw_T' if self.preprocesing_rm_stopwords else desc + '_stpw_F'
        desc = desc + '_filter_T' if self.filter_guis else desc + '_filter_F'
        return desc