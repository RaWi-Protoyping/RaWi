from typing import Text, List, Optional, Dict, Tuple, Set
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.preprocessing.preprocess import Preprocessor
from gui2r.preprocessing.extraction import Extractor
import gui2r.utils as utils
from rank_bm25 import BM25Okapi
import os, pickle
import numpy as np

import logging

logging.getLogger().setLevel(logging.INFO)


class BM25OkapiRanker(Ranker):

    preprocessor = Preprocessor()
    extractor = Extractor(preprocessor)

    def __init__(self, model: BM25Okapi, index_mapping: Dict[int, int],
                 conf: Configuration):
        self.model = model
        self.index_mapping = index_mapping
        self.conf = conf

    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('BM25OkapiRanker: Ranking for "{}"'.format(query))
        preproc_query = BM25OkapiRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        top_n = self.get_top_n(preproc_query, n=rank_cutoff)
        return [(self.index_mapping[index], conf) for index, conf in top_n]

    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('BM25OkapiRanker: Ranking for "{}"'.format(query))
        preproc_query = BM25OkapiRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        top_n = self.get_top_n(preproc_query, n=self.model.corpus_size)
        return [(self.index_mapping[index], conf) for index, conf in top_n if self.index_mapping[index] in goldstandard]

    def get_top_n(self, query: List[Text], n: Optional[int] = 5):
        scores = self.model.get_scores(query)
        top_n_args = np.argsort(scores)[::-1][:n]
        top_n_sims = np.sort(scores)[::-1][:n]
        max_sim = np.sort(scores)[::-1][0]
        return [(arg, (sim / max_sim)) for (arg, sim) in zip(top_n_args, top_n_sims)]

    def persist(self, path: Optional[Text]) -> None:
        with open(path + 'bm25okapi.pickle', mode='wb') as file:
            pickle.dump(self.model, file)
        with open(path + 'bm25okapi_index_mapping.pickle', mode='wb') as file:
            pickle.dump(self.index_mapping, file)

    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True) -> "BM25OkapiRanker":
        model_path = conf.path_models + 'vsm_bm25okapi/' + conf.get_desc() + '/'
        if force or (not os.path.exists(model_path)) \
                or (not os.path.isfile(model_path + 'bm25okapi.pickle')) \
                or (not os.path.isfile(model_path + 'bm25okapi_index_mapping.pickle')):
            utils.mk_dir_if_not_exists(model_path)
            dataset = BM25OkapiRanker.extractor.load_dataset(conf=conf)
            bow_corpus = [(Ranker.get_text(conf, data), data['filename']) for (index, data) in dataset.iterrows()]
            bow_corpus, names = map(list, zip(*bow_corpus))
            index_mapping = BM25OkapiRanker.build_index_mapping(names)
            bm25 = BM25Okapi(bow_corpus)
            logging.info('BM25OkapiRanker : initialized')
            bm25_ranker = BM25OkapiRanker(model=bm25, index_mapping=index_mapping, conf=conf)
            bm25_ranker.persist(model_path)
            return bm25_ranker
        else:
            with open(model_path + 'bm25okapi.pickle', mode='rb') as file:
                bm25 = pickle.load(file)
                logging.info('BM25OkapiRanker : loading bm25okapi.pickle from {}'.format(model_path))
            with open(model_path + 'bm25okapi_index_mapping.pickle', mode='rb') as file:
                index_mapping = pickle.load(file)
                logging.info('BM25OkapiRanker : loading bm25_index_mapping.pickle from {}'.format(model_path))
            logging.info('BM25OkapiRanker : initialized')
            return BM25OkapiRanker(model=bm25, index_mapping=index_mapping, conf=conf)

    @staticmethod
    def build_index_mapping(names: List[Text]) -> Dict[int, int]:
        mapping ={}
        for index, name in enumerate(names):
            mapping[index] = int(name.split('.')[0])
        return mapping

    def get_name(self):
        return Ranker.R_BM25OKAPI
