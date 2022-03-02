from typing import Text, List, Optional, Tuple, Dict, Set
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.retrieval.ranker.bm25okapi_weighted_ranker import BM25OkapiWeightedRanker
from gui2r.preprocessing.extraction import Extractor
from gui2r.preprocessing.preprocess import Preprocessor
import pandas as pd
import numpy as np

import logging


logging.getLogger().setLevel(logging.INFO)


class LocalPrfKldCatWeightedBM25ExpanderRanker(Ranker):

    preprocessor = Preprocessor()
    extractor = Extractor(preprocessor)

    def __init__(self, conf: Configuration, internal_ranker: BM25OkapiWeightedRanker,
                 dataset: pd.DataFrame, counter: Dict[Text, Dict[Text, int]],
                 probs_t_dc: Dict[Text, Dict[Text, float]], k: Optional[int] = 10,
                 top_w_per_cat: Optional[Dict[Text, int]] = None, cats: Optional[List[Text]] = None):
        self.conf = conf
        self.ranker = internal_ranker
        self.dataset = dataset
        self.counter = counter
        self.probs_t_dc = probs_t_dc
        self.k = k
        if not top_w_per_cat:
            top_w_per_cat = {Extractor.DATA_ACTIVITY_NAME: 2, Extractor.DATA_TEXT_VISIBLE: 2,
                             Extractor.DATA_TEXT_INVISIBLE: 2, Extractor.DATA_RES_IDS_VISIBLE: 2,
                             Extractor.DATA_RES_IDS_INVISIBLE: 2, Extractor.DATA_ICON_IDS: 2}
        self.top_w_per_cat = top_w_per_cat
        if not cats:
            cats = ['text_activity_name', 'text_visible', 'text_invisible', 'text_res_ids', 'text_icon_ids']
        self.cats = cats

    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('LocPrfKldCatWeightedRanker: Ranking for "{}"'.format(query))
        preproc_query = LocalPrfKldCatWeightedBM25ExpanderRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed)
        preproc_query_w = [(token, 1) for token in preproc_query]
        ranking = self.ranker.rank(preproc_query_w, rank_cutoff=rank_cutoff)
        probs_t_dr = self.get_probs_from_top([index for index, conf in ranking])
        top_cands = self.get_top_expansion_cands_per_cat(probs_t_dr, self.probs_t_dc,
                                                         rm_tokens=preproc_query, ensure_unique=True)
        preproc_query_w.extend(top_cands)
        re_ranking = self.ranker.rank(preproc_query_w, rank_cutoff=rank_cutoff)
        return re_ranking

    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('LocPrfKldCatWeightedRanker: Ranking for "{}"'.format(query))
        preproc_query = LocalPrfKldCatWeightedBM25ExpanderRanker.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed)
        preproc_query_w = [(token, 1) for token in preproc_query]
        ranking = self.ranker.rank(preproc_query_w, rank_cutoff=rank_cutoff)
        probs_t_dr = self.get_probs_from_top([index for index, conf in ranking])
        top_cands = self.get_top_expansion_cands_per_cat(probs_t_dr, self.probs_t_dc,
                                                         rm_tokens=preproc_query, ensure_unique=True)
        preproc_query_w.extend(top_cands)
        re_ranking = self.ranker.rank_gs(preproc_query_w, goldstandard, rank_cutoff=rank_cutoff)
        return re_ranking

    def get_top_expansion_cands_per_cat(self, probs_t_dr: Dict[Text, Dict[Text, float]],
                                probs_t_dc: Dict[Text, Dict[Text, float]],
                                rm_tokens: Optional[List[Text]] = None,
                                ensure_unique: Optional[bool] = True) -> List[Tuple[Text, float]]:
        if set(probs_t_dr.keys()) != set(probs_t_dc.keys()):
            raise ValueError('ProbR and ProbC dictionaries do not contain the same categories')
        top_words = []
        for index, name in enumerate(self.cats):
            top_words_cat = self.get_top_expansion_cands(probs_t_dr=probs_t_dr[name],
                                                         probs_t_dc=probs_t_dc[name], rm_tokens=rm_tokens)
            top_words_cat = top_words_cat[:self.top_w_per_cat[name]]
            top_words.extend(top_words_cat)
        if ensure_unique:
            top_words = list(set(top_words))
        return top_words

    @staticmethod
    def get_top_expansion_cands(probs_t_dr: Dict[Text, float], probs_t_dc: Dict[Text, float],
                                rm_tokens: Optional[List[Text]] = None) -> List[Tuple[Text, float]]:
        scores_kld = {}
        for word, prob_t_dr in probs_t_dr.items():
            if word not in rm_tokens:
                scores_kld[word] = LocalPrfKldCatWeightedBM25ExpanderRanker.\
                    kullback_leibler_divergence(prob_t_dr=prob_t_dr, prob_t_dc=probs_t_dc[word])
        top_words = [(k,v) for k, v in sorted(scores_kld.items(), key=lambda item: item[1], reverse=True)]
        return top_words

    def get_probs_from_top(self, indexes: List[int]) -> Dict[Text, Dict[Text, float]]:
        top_indexes = indexes[:self.k]
        results = self.dataset.loc[self.dataset['fileindex'].isin(top_indexes),]
        all_counts = {name: {} for name in self.cats}
        all_probs = {name: {} for name in self.cats}
        all_sums = {name: 0 for name in self.cats}
        for index, data in results.iterrows():
            for name in self.cats:
                text = data[name]
                for token in text:
                    if all_counts[name].get(token):
                        all_counts[name][token] += 1
                    else:
                        all_counts[name][token] = 1
                all_sums[name] += len(text)
        for name, counts in all_counts.items():
            all_probs[name] = {token: (count / all_sums[name]) for token, count in counts.items()}
        return all_probs

    @staticmethod
    def kullback_leibler_divergence(prob_t_dr: float, prob_t_dc: float):
        return prob_t_dr * (np.log((prob_t_dr / prob_t_dc)))

    def persist(self, path: Optional[Text]) -> None:
        pass

    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True) -> "LocalPrfKldCatWeightedBM25ExpanderRanker":
        dataset = LocalPrfKldCatWeightedBM25ExpanderRanker.extractor.load_dataset(conf=conf)
        dataset.loc[:, 'fileindex'] = dataset.loc[:, 'filename'].apply(lambda x: int(x.split('.')[0]))
        if len(conf.text_segments_used) == 1 and conf.text_segments_used[0] == Extractor.DATA_ALL:
            text_segments = [Extractor.DATA_ACTIVITY_NAME, Extractor.DATA_TEXT_VISIBLE, Extractor.DATA_TEXT_INVISIBLE,
                             Extractor.DATA_RES_IDS_VISIBLE, Extractor.DATA_RES_IDS_INVISIBLE, Extractor.DATA_ICON_IDS]
        else:
            text_segments = conf.text_segments_used
        logging.info('LocPrfKldCatWeightedRanker: Using Text Segments: {}'.format(text_segments))
        segment_top_ws = {Extractor.DATA_ACTIVITY_NAME: 2, Extractor.DATA_TEXT_VISIBLE: 2,
                          Extractor.DATA_TEXT_INVISIBLE: 2, Extractor.DATA_RES_IDS_VISIBLE: 2,
                          Extractor.DATA_RES_IDS_INVISIBLE: 2, Extractor.DATA_ICON_IDS: 2}
        internal_ranker = BM25OkapiWeightedRanker.load(conf, persist=persist)
        counter, probs = LocalPrfKldCatWeightedBM25ExpanderRanker.create_counter(dataset, text_segments=text_segments)
        return LocalPrfKldCatWeightedBM25ExpanderRanker(conf=conf, internal_ranker=internal_ranker,
                                                        dataset=dataset, counter=counter, probs_t_dc=probs,
                                                        cats=text_segments, top_w_per_cat=segment_top_ws)

    @staticmethod
    def create_counter(dataset: pd.DataFrame, text_segments: List[Text]) -> \
            Tuple[Dict[Text, Dict[Text, int]], Dict[Text, Dict[Text, float]]]:
        all_counts = {name: {} for name in text_segments}
        all_probs = {}
        all_sums = {name: 0 for name in text_segments}
        for (index, data) in dataset.iterrows():
            for name in text_segments:
                text = data[name]
                for token in text:
                    if all_counts[name].get(token):
                        all_counts[name][token] += 1
                    else:
                        all_counts[name][token] = 1
                all_sums[name] += len(text)
        for name, counts in all_counts.items():
            all_probs[name] = {token: (count / all_sums[name]) for token, count in counts.items()}
        return all_counts, all_probs

    def get_name(self):
        return Ranker.R_PRF_KLD_CAT_WEIGHTED_BM25
