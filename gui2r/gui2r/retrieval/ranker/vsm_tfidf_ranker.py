from typing import Text, List, Optional, Dict, Tuple, Set
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.preprocessing.preprocess import Preprocessor
from gui2r.preprocessing.extraction import Extractor
import gui2r.utils as utils
from gensim import corpora
from gensim.models import TfidfModel
from gensim.similarities import SparseMatrixSimilarity
import os, pickle

import logging

logging.getLogger().setLevel(logging.INFO)


class TFIDFRanker(Ranker):

    preprocessor = Preprocessor()
    extractor = Extractor(preprocessor)

    def __init__(self, dictionary: corpora.Dictionary,
                 bow_corpus: corpora.MmCorpus,
                 model: TfidfModel, index: SparseMatrixSimilarity,
                 index_mapping: Dict[int, int],
                 conf: Configuration):
        self.dictionary = dictionary
        self.bow_corpus = bow_corpus
        self.model = model
        self.index = index
        self.index_mapping = index_mapping
        self.conf = conf

    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('TFIDFRanker: Ranking for "{}"'.format(query))
        preproc_query = TFIDFRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        preproc_query_bow = self.dictionary.doc2bow(preproc_query)
        similarities = self.index[self.model[preproc_query_bow]]
        return sorted([(self.index_mapping[index], sim)
                for index, sim in enumerate(similarities)],
                key=lambda x: x[1], reverse=True)[:rank_cutoff]

    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('TFIDFRanker: Ranking for "{}"'.format(query))
        preproc_query = TFIDFRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        preproc_query_bow = self.dictionary.doc2bow(preproc_query)
        similarities = self.index[self.model[preproc_query_bow]]
        return sorted([(self.index_mapping[index], sim)
                for index, sim in enumerate(similarities) if self.index_mapping[index] in goldstandard],
                      key=lambda x: x[1], reverse=True)

    def persist(self, path: Optional[Text]) -> None:
        self.dictionary.save(path + 'dict.dictionary')
        corpora.MmCorpus.serialize(path + 'corpus.mm', self.bow_corpus)
        self.model.save(path + 'tfidf.model')
        self.index.save(path + 'tfidf.index')
        with open(path + 'index_mapping.pickle', mode='wb') as file:
            pickle.dump(self.index_mapping, file)

    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True) -> "TFIDFRanker":
        model_path = conf.path_models + 'vsm_tfidf/' + conf.get_desc() + '/'
        if force or (not os.path.exists(model_path)) \
                or (not os.path.isfile(model_path + 'corpus.mm')) \
                or (not os.path.isfile(model_path + 'tfidf.model')):
            utils.mk_dir_if_not_exists(model_path)
            dataset = TFIDFRanker.extractor.load_dataset(conf=conf)
            dictionary = corpora.Dictionary([Ranker.get_text(conf, data) for (index, data) in dataset.iterrows()])
            bow_corpus = [(dictionary.doc2bow(Ranker.get_text(conf, data)), data['filename'])
                          for (index, data) in dataset.iterrows()]
            bow_corpus, names = map(list, zip(*bow_corpus))
            index_mapping = TFIDFRanker.build_index_mapping(names)
            corpora.MmCorpus.serialize(model_path + 'corpus.mm', bow_corpus)
            mm_corpus = corpora.MmCorpus(model_path + 'corpus.mm')
            tfidf_model = TfidfModel(mm_corpus, )
            tfidf_index = SparseMatrixSimilarity(tfidf_model[mm_corpus],
                                                 num_features=mm_corpus.num_terms)
            ranker = TFIDFRanker(dictionary=dictionary, bow_corpus=mm_corpus,
                                 model=tfidf_model, index=tfidf_index, index_mapping=index_mapping, conf=conf)
            ranker.persist(model_path)
            logging.info('TFIDFRanker : initialized')
            logging.info('TFIDFRanker : model : {}'.format(tfidf_model))
            logging.info('TFIDFRanker : index : {}'.format(tfidf_index))
            return ranker
        else:
            dictionary = corpora.Dictionary.load(model_path + 'dict.dictionary')
            mm_corpus = corpora.MmCorpus(model_path+ 'corpus.mm')
            tfidf_model = TfidfModel.load(model_path + 'tfidf.model')
            tfidf_index = SparseMatrixSimilarity.load(model_path + 'tfidf.index')
            with open(model_path + 'index_mapping.pickle', mode='rb') as file:
                index_mapping = pickle.load(file)
                logging.info('TFIDFRanker : initialized')
            return TFIDFRanker(dictionary=dictionary,bow_corpus=mm_corpus,
                               model=tfidf_model,index=tfidf_index,index_mapping=index_mapping,conf=conf)

    @staticmethod
    def build_index_mapping(names: List[Text]) -> Dict[int, int]:
        mapping ={}
        for index, name in enumerate(names):
            mapping[index] = int(name.split('.')[0])
        return mapping

    def get_name(self):
        return Ranker.R_TFIDF
