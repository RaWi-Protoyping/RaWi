from typing import Text, List, Optional, Dict, Tuple, Set
from gui2r.documents import Document, RankedDocument
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.preprocessing.preprocess import Preprocessor
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.ranker.vsm_tfidf_ranker import TFIDFRanker
from gui2r.retrieval.ranker.bm25okapi_ranker import BM25OkapiRanker
from gui2r.retrieval.ranker.sentence_bert_ranker import SentenceBERTRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_bm25_expander import LocalPrfKldBM25ExpanderRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_cat_bm25_expander import LocalPrfKldCatBM25ExpanderRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_bm25_weighted_expander import LocalPrfKldWeightedBM25ExpanderRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_bm25_cat_weighted_expander import LocalPrfKldCatWeightedBM25ExpanderRanker
from gui2r.retrieval.ranker.bool_iwcs_ranker import BoolIWCSRanker

import logging

logging.getLogger().setLevel(logging.INFO)


class Retriever(object):

    def __init__(self, conf: Configuration, ranker: Optional[Dict[Text, Ranker]] = None):
        self.conf = conf
        if ranker:
            self.ranker = ranker
        else:
            self.ranker = {Ranker.R_BM25OKAPI : BM25OkapiRanker.load(conf),
                           Ranker.R_IWCS: BoolIWCSRanker.load(conf),
                           Ranker.R_TFIDF: TFIDFRanker.load(conf),
                           Ranker.R_PRF_KLD_WEIGHTED_BM25: LocalPrfKldWeightedBM25ExpanderRanker.load(conf),
                           Ranker.R_PRF_KLD_CAT_WEIGHTED_BM25: LocalPrfKldCatWeightedBM25ExpanderRanker.load(conf),
                           Ranker.R_PRF_KLD_CAT_BM25: LocalPrfKldCatBM25ExpanderRanker.load(conf),
                           Ranker.R_PRF_KLD_BM25: LocalPrfKldBM25ExpanderRanker.load(conf),
                           Ranker.R_SENTBERT : SentenceBERTRanker.load(conf)}
        self.preprocessor = Preprocessor()
        self.expander = {}

    def rank(self, query: Text, method: Optional[Text] =
             Ranker.R_BM25OKAPI, qe_method: Optional[Text] = None,
             max_results: Optional[int] = 100) -> List[RankedDocument]:
        ranker = self.ranker[method]
        preproc_query = self.preprocessor.preprocess_text(query, tokenized=True,
                                                          remove_stopwords=self.conf.preprocesing_rm_stopwords,
                                                          stemmed=self.conf.preprocesing_stemmed)
        logging.info('Ret:Preproc-Query : {}'.format(preproc_query))
        result = ranker.rank(query, rank_cutoff=max_results)
        ranked_docs = self.construct_ranked_docs(result)
        return ranked_docs

    def rank_gs(self, query: Text, goldstandard: Set[int], method: Optional[Text] =
             Ranker.R_BM25OKAPI, qe_method: Optional[Text] = None,
             max_results: Optional[int] = 100) -> List[RankedDocument]:
        ranker = self.ranker[method]
        preproc_query = self.preprocessor.preprocess_text(query, tokenized=True,
                                                          remove_stopwords=self.conf.preprocesing_rm_stopwords,
                                                          stemmed=self.conf.preprocesing_stemmed)
        logging.info('Ret:Preproc-Query : {}'.format(preproc_query))
        result = ranker.rank_gs(query, goldstandard, rank_cutoff=max_results)
        ranked_docs = self.construct_ranked_docs(result)
        return ranked_docs

    def construct_ranked_docs(self, results: List[Tuple[int, float]]):
        ranked_docs = [RankedDocument(document=
            Document(index, self.conf.path_guis+str(index)+'.jpg', str(index)+'.jpg'), rank=rank, conf=conf)
                       for (rank, (index, conf)) in enumerate(results, start=1)]
        return ranked_docs