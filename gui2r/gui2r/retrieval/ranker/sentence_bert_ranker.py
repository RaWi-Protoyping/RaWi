from typing import Text, List, Optional, Dict, Tuple, Set
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.preprocessing.preprocess import Preprocessor
from gui2r.preprocessing.extraction import Extractor
import gui2r.utils as utils
import os, pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import scipy.spatial as spatial

import logging

logging.getLogger().setLevel(logging.INFO)


class SentenceBERTRanker(Ranker):

    preprocessor = Preprocessor()
    extractor = Extractor(preprocessor)

    def __init__(self, conf: Configuration,
                 model: SentenceTransformer,
                 doc_embedding: np.array,
                 index_mapping: Dict[int, int],
                 inverse_index_mapping: Dict[int, int]):
        self.conf = conf
        self.model = model
        self.doc_embedding = doc_embedding
        self.index_mapping = index_mapping
        self.inverse_index_mapping = inverse_index_mapping

    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('SentenceBERTRanker: Ranking for "{}"'.format(query))
        preproc_query = SentenceBERTRanker.preprocessor.\
            preprocess_text(query, tokenized=False, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        query_embedded = self.model.encode(preproc_query)
        top_n = self.get_ranking_over_docs(query_embedded, n=rank_cutoff)
        return [(self.index_mapping[index], conf) for index, conf in top_n]

    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('SentenceBERTRanker: Ranking for "{}"'.format(query))
        preproc_query = SentenceBERTRanker.preprocessor.\
            preprocess_text(query, tokenized=False, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        query_embedded = self.model.encode(preproc_query)
        top_n = self.get_ranking_over_docs(query_embedded, n=57764)
        return [(self.index_mapping[index], conf) for index, conf in top_n if self.index_mapping[index] in goldstandard]

    def get_ranking_over_docs(self, query_embedded: np.array, n) \
        -> List[Tuple[int, float]]:
        query_embedded_reshaped = query_embedded.reshape(1,-1)
        relevant_corpus = self.doc_embedding
        distances = spatial.distance.cdist(relevant_corpus, query_embedded_reshaped, 'cosine')
        similarities = 1 - distances
        similarities_reshaped = similarities.flatten()
        top_n_args = np.argsort(similarities_reshaped)[::-1][:n]
        top_n_sims = np.sort(similarities_reshaped)[::-1][:n]
        return [(arg, sim) for (arg, sim) in zip(top_n_args, top_n_sims)]

    def persist(self, path: Optional[Text]) -> None:
        with open(path + 'index_mapping.pickle', mode='wb') as file:
            pickle.dump(self.index_mapping, file)
        with open(path + 'inverse_index_mapping.pickle', mode='wb') as file:
            pickle.dump(self.inverse_index_mapping, file)
        np.save(path + 'doc_embedding.npy', self.doc_embedding)

    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True) -> "SentenceBERTRanker":
        model_path = conf.path_models + 'sentence_bert_ranker/' + conf.get_desc() + '/'
        if force or (not os.path.isfile(model_path + 'index_mapping.pickle')) \
                   or (not os.path.isfile(model_path + 'doc_embedding.npy')) \
                   or (not os.path.isfile(model_path + 'inverse_index_mapping.pickle')):
            utils.mk_dir_if_not_exists(model_path)
            dataset = SentenceBERTRanker.extractor.load_dataset(conf=conf)
            corpus = [(Ranker.get_text(Configuration(), data), data['filename']) for (index, data) in dataset.iterrows()]
            corpus, names = map(list, zip(*corpus))
            corpus = [elem if len(elem)<=100 else elem[:100] for elem in corpus]
            corpus = [' '.join(elem) for elem in corpus]
            index_mapping = SentenceBERTRanker.build_index_mapping(names)
            inverse_index_mapping = SentenceBERTRanker.build_inverse_index_mapping(names)
            model = SentenceTransformer('all-mpnet-base-v2')
            doc_embedding = model.encode(corpus)
            logging.info('SentenceBERTRanker : initialized')
            sentBERT_ranker = SentenceBERTRanker(conf, model, doc_embedding, index_mapping, inverse_index_mapping)
            sentBERT_ranker.persist(model_path)
            return sentBERT_ranker
        else:
            with open(model_path + 'index_mapping.pickle', mode='rb') as file:
                index_mapping = pickle.load(file)
            with open(model_path + 'inverse_index_mapping.pickle', mode='rb') as file:
                inverse_index_mapping = pickle.load(file)
            doc_embedding = np.load(model_path + 'doc_embedding.npy')
            model = SentenceTransformer('all-mpnet-base-v2')
            logging.info('SentenceBERTRanker : initialized')
            return SentenceBERTRanker(conf, model, doc_embedding, index_mapping, inverse_index_mapping)

    @staticmethod
    def build_index_mapping(names: List[Text]) -> Dict[int, int]:
        mapping ={}
        for index, name in enumerate(names):
            mapping[index] = int(name.split('.')[0])
        return mapping

    @staticmethod
    def build_inverse_index_mapping(names: List[Text]) -> Dict[int, int]:
        mapping = {}
        for index, name in enumerate(names):
            mapping[int(name.split('.')[0])] = index
        return mapping

    def get_name(self):
        return Ranker.R_SENTBERT
