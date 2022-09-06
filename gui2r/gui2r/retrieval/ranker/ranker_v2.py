from abc import ABC, abstractmethod
from typing import Optional, Text, List, Tuple, Set
from gui2r.retrieval.configuration.conf import Configuration


class Ranker(ABC):

    # Baseline ranking models
    R_TFIDF = 'tfidf-retrieval'
    R_BM25OKAPI = 'bm25okapi'
    R_IWCS = 'iwcs' # This denotes the nBOW model
    # PRF-KLD BM25
    R_PRF_KLD_BM25 = 'prf_kld_bm25'
    R_PRF_KLD_WEIGHTED_BM25 = 'prf_kld_weighted_bm25'
    R_PRF_KLD_CAT_BM25 = 'prf_kld_cat_bm25'
    R_PRF_KLD_CAT_WEIGHTED_BM25 = 'prf_kld_cat_weighted_bm25'
    # BERT baseline and BERT-LTR models
    R_SENTBERT = 'sent-bert'
    R_BERT_POINTWISE_1 = 'tfr-bert (loss_pointwise)'
    R_BERT_PAIRWISE = 'tfr-bert (loss_pairwise)'
    R_BERT_POINTWISE_2 = 'tfr-bert (loss_pointwise_softmax)'

    @abstractmethod
    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        raise NotImplementedError

    @abstractmethod
    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        raise NotImplementedError

    @abstractmethod
    def persist(self, path: Optional[Text]) -> None:
        raise NotImplementedError

    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True) -> "Ranker":
        raise NotImplementedError

    @abstractmethod
    def get_name(self):
        raise NotImplementedError

    @staticmethod
    def get_text(conf: Configuration, data) -> List[Text]:
        text = []
        for text_segment in conf.text_segments_used:
            text.extend(data[text_segment])
        return text