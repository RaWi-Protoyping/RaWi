from typing import Text, List, Optional, Tuple, Dict, Set
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.retrieval.ranker.bm25okapi_ranker import BM25OkapiRanker
from gui2r.preprocessing.extraction import Extractor
from gui2r.preprocessing.preprocess import Preprocessor
from collections import Counter
import pandas as pd
import numpy as np

import logging


logging.getLogger().setLevel(logging.INFO)


class LocalPrfKldBM25ExpanderRanker(Ranker):

    preprocessor = Preprocessor()
    extractor = Extractor(preprocessor)

    def __init__(self, conf: Configuration, internal_ranker: Ranker,
                 dataset: pd.DataFrame, counter: Dict[Text, int],
                 probs_t_dc: Dict[Text, float], k: Optional[int] = 10, top_w: Optional[int] = 10):
        self.conf = conf
        self.ranker = internal_ranker
        self.dataset = dataset
        self.counter = counter
        self.probs_t_dc = probs_t_dc
        self.k = k
        self.top_w = top_w

    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('LocPrfKldRanker: Ranking for "{}"'.format(query))
        ranking = self.ranker.rank(query, rank_cutoff=rank_cutoff)
        probs_t_dr = self.get_probs_from_top([index for index, conf in ranking])
        preproc_query = LocalPrfKldBM25ExpanderRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed)
        all_cands = self.get_top_expansion_cands(probs_t_dr, rm_tokens=preproc_query)
        top_cands = all_cands[:self.top_w]
        preproc_query.extend(top_cands)
        preproc_query = LocalPrfKldBM25ExpanderRanker.preprocessor.\
            detokenizer.detokenize(preproc_query)
        re_ranking = self.ranker.rank(preproc_query, rank_cutoff=rank_cutoff)
        return re_ranking

    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('LocPrfKldRanker: Ranking for "{}"'.format(query))
        ranking = self.ranker.rank(query, rank_cutoff=rank_cutoff)
        probs_t_dr = self.get_probs_from_top([index for index, conf in ranking])
        preproc_query = LocalPrfKldBM25ExpanderRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed)
        all_cands = self.get_top_expansion_cands(probs_t_dr, rm_tokens=preproc_query)
        top_cands = all_cands[:self.top_w]
        preproc_query.extend(top_cands)
        preproc_query = LocalPrfKldBM25ExpanderRanker.preprocessor.\
            detokenizer.detokenize(preproc_query)
        re_ranking = self.ranker.rank_gs(preproc_query, goldstandard, rank_cutoff=rank_cutoff)
        return re_ranking

    def get_top_expansion_cands(self, probs_t_dr: Dict[Text, float],
                                rm_tokens: Optional[List[Text]] = None) -> List[Text]:
        scores_kld = {}
        for word, prob_t_dr in probs_t_dr.items():
            if word not in rm_tokens:
                scores_kld[word] = LocalPrfKldBM25ExpanderRanker.\
                    kullback_leibler_divergence(prob_t_dr=prob_t_dr, prob_t_dc=self.probs_t_dc[word])
        top_words = [k for k, v in sorted(scores_kld.items(), key=lambda item: item[1], reverse=True)]
        return top_words

    def get_probs_from_top(self, indexes: List[int]):
        top_indexes = indexes[:self.k]
        results = self.dataset.loc[self.dataset['fileindex'].isin(top_indexes),]
        words = []
        for index, data in results.iterrows():
            text = Ranker.get_text(self.conf, data)
            words.extend(text)
        counter = Counter(words)
        sum = len(words)
        probs = {word: (count / sum) for word, count in counter.items()}
        return probs

    @staticmethod
    def kullback_leibler_divergence(prob_t_dr: float, prob_t_dc: float):
        return prob_t_dr * (np.log((prob_t_dr / prob_t_dc)))

    def persist(self, path: Optional[Text]) -> None:
        pass

    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True) -> "LocalPrfKldBM25ExpanderRanker":
        dataset = LocalPrfKldBM25ExpanderRanker.extractor.load_dataset(conf=conf)
        dataset.loc[:, 'fileindex'] = dataset.loc[:, 'filename'].apply(lambda x: int(x.split('.')[0]))
        internal_ranker = BM25OkapiRanker.load(conf, persist=persist)
        counter, probs = LocalPrfKldBM25ExpanderRanker.create_counter(conf, dataset)
        return LocalPrfKldBM25ExpanderRanker(conf=conf, internal_ranker=internal_ranker,
                                             dataset=dataset, counter=counter, probs_t_dc=probs)

    @staticmethod
    def create_counter(conf: Configuration, dataset: pd.DataFrame) -> Tuple[Dict[Text, int], Dict[Text, float]]:
        text = [Ranker.get_text(conf, data) for (index, data) in dataset.iterrows()]
        counter = {}
        sum = 0
        for index, t_list in enumerate(text):
            sum += len(t_list)
            for token in t_list:
                if counter.get(token): counter[token] += 1
                else: counter[token] = 1
        probs = {token: (count / sum) for token, count in counter.items()}
        return counter, probs

    def get_name(self):
        return Ranker.R_PRF_KLD_BM25
