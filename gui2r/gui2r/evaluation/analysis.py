from typing import Text, List, Callable, Dict, Tuple
import gui2r.evaluation.rank_metrics as metrics
import numpy as np
from ast import literal_eval
from gui2r.preprocessing.extraction import Extractor
from gui2r.retrieval.retriever import Retriever
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.retrieval.ranker.vsm_tfidf_ranker import TFIDFRanker
from gui2r.retrieval.ranker.bm25okapi_ranker import BM25OkapiRanker
from gui2r.retrieval.ranker.sentence_bert_ranker import SentenceBERTRanker
from gui2r.retrieval.ranker.tfr_bert_ranker import TFRBertRanker
from gui2r.retrieval.ranker.bool_iwcs_ranker import BoolIWCSRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_bm25_expander import LocalPrfKldBM25ExpanderRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_cat_bm25_expander import LocalPrfKldCatBM25ExpanderRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_bm25_weighted_expander import LocalPrfKldWeightedBM25ExpanderRanker
from gui2r.retrieval.query_expansion.loc_prf_kld_bm25_cat_weighted_expander import LocalPrfKldCatWeightedBM25ExpanderRanker
import pandas as pd
from tabulate import tabulate


import logging

logging.getLogger().setLevel(logging.INFO)


class Metric(object):

    def __init__(self, func: Callable, name: Text):
        self.func = func
        self.name = name

class EvaluationAnalysis(object):

    @staticmethod
    def run(goldstandard: ["pd.Dataframe"], rankers: List[Tuple[Text, Configuration]],
            metrics: List[Metric]) -> Dict[Text, Dict[Text, Text]]:
        results = {}
        for ranker, conf in rankers:
            ranker = EvaluationAnalysis.get_ranker_instance(ranker, conf)
            retriever = Retriever(conf, {ranker.get_name(): ranker})
            ranker_results = {}
            for i, row in goldstandard.iterrows():
                logging.info('Index: {}, Query: {}'.format(i, row['query']))
                docs = retriever.rank_gs(row['query'], set(row['gui_indexes']), method=ranker.get_name())
                ranks = [ranked_doc.document.index for ranked_doc in docs]
                rel_mapping = {gui_index: row['relevance'][index] for index, gui_index in enumerate(row['gui_indexes'])}
                rel_ranking = [rel_mapping[rank] for rank in ranks]
                for metric in metrics:
                    metric_result = metric.func(rel_ranking)
                    if ranker_results.get(metric.name, None):
                        ranker_results[metric.name].append(metric_result)
                    else:
                        ranker_results[metric.name] = [metric_result]
            dict_avg_results = {}
            for key, values in ranker_results.items():
                val = round(np.mean(values), 3)
                dict_avg_results[key] = '.' + str(val).split('.')[1]  if val < 1.0 else '1.0'
            results[ranker.get_name()] = dict_avg_results
        EvaluationAnalysis.print_table_report(results, metrics)
        return results

    @staticmethod
    def binarize_annotations(annotations: List[int]) -> List[int]:
        return [1 if anno >= 2 else 0 for anno in annotations]

    @staticmethod
    def fill_results_zeros(annotations: List[int], k: int) -> List[int]:
        if len(annotations) >= k: return annotations
        else: return annotations + list(np.zeros((k - len(annotations)), dtype=int))

    @staticmethod
    def print_table_report(results: Dict[Text, Dict[Text, Text]], metrics: List[Metric]) -> None:
        header = ['method']
        header.extend([metric.name for metric in metrics])
        table = []
        for key1, val1 in results.items():
            row = [key1]
            row.extend([val for val in val1.values()])
            table.append(row)
        print(tabulate(tabular_data=table, headers=header))

    @staticmethod
    def get_ranker_instance(ranker: Text, config: Configuration) -> Ranker:
        if ranker == Ranker.R_TFIDF: return TFIDFRanker.load(config)
        if ranker == Ranker.R_BM25OKAPI: return BM25OkapiRanker.load(config)
        if ranker == Ranker.R_IWCS: return BoolIWCSRanker.load(config)
        if ranker == Ranker.R_PRF_KLD_BM25: return LocalPrfKldBM25ExpanderRanker.load(config)
        if ranker == Ranker.R_PRF_KLD_CAT_BM25: return LocalPrfKldCatBM25ExpanderRanker.load(config)
        if ranker == Ranker.R_PRF_KLD_WEIGHTED_BM25: return LocalPrfKldWeightedBM25ExpanderRanker.load(config)
        if ranker == Ranker.R_PRF_KLD_CAT_WEIGHTED_BM25: return LocalPrfKldCatWeightedBM25ExpanderRanker.load(config)
        if ranker == Ranker.R_SENTBERT: return SentenceBERTRanker.load(config)
        if ranker == Ranker.R_BERT_POINTWISE_1: return TFRBertRanker.load(config, model=TFRBertRanker.R_BERT_POINTWISE_1)
        if ranker == Ranker.R_BERT_PAIRWISE: return TFRBertRanker.load(config, model=TFRBertRanker.R_BERT_PAIRWISE)
        if ranker == Ranker.R_BERT_POINTWISE_2: return TFRBertRanker.load(config, model=TFRBertRanker.R_BERT_POINTWISE_2)

    @staticmethod
    def cast_annotations(x):
        lit_eval = literal_eval(x)
        if lit_eval:
            if isinstance(lit_eval, int): return [lit_eval]
            else: return list(lit_eval)
        else: return []


if __name__ == '__main__':
    # Define metrics as lambdas bound to generic metric functions
    # First we simply use the AveP metric function
    aveP = lambda annotations: metrics.average_precision(
        EvaluationAnalysis.binarize_annotations(annotations))
    metricAveP = Metric(func=aveP, name='AveP')
    # Second we also compute the recriprocal rank
    recipRank = lambda annotations: metrics.reciprocal_rank(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 15)
        ))
    metricRecipRank = Metric(func=recipRank, name='RecipRank')
    # Third we also compute the precision@k
    pAt1 = lambda annotations: metrics.precision_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 1)), 1)
    metricPAt1 = Metric(func=pAt1, name='P@1')
    pAt3 = lambda annotations: metrics.precision_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 3)
        ), 3)
    metricPAt3 = Metric(func=pAt3, name='P@3')
    pAt5 = lambda annotations: metrics.precision_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 5)
        ), 5)
    metricPAt5 = Metric(func=pAt5, name='P@5')
    pAt7 = lambda annotations: metrics.precision_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 7)
        ), 7)
    metricPAt7 = Metric(func=pAt7, name='P@7')
    pAt10 = lambda annotations: metrics.precision_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 10)
        ), 10)
    metricPAt10 = Metric(func=pAt10, name='P@10')
    pAt15 = lambda annotations: metrics.precision_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 15)
        ), 15)
    metricPAt15 = Metric(func=pAt15, name='P@15')
    # Fourth we define the HITS@k metrics
    hitsAt1 = lambda annotations: metrics.hits_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 1)
        ), 1)
    metricHitsAt1 = Metric(func=hitsAt1, name='HITS@1')
    hitsAt3 = lambda annotations: metrics.hits_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 3)
        ), 3)
    metricHitsAt3 = Metric(func=hitsAt3, name='HITS@3')
    hitsAt5 = lambda annotations: metrics.hits_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 5)
        ), 5)
    metricHitsAt5 = Metric(func=hitsAt5, name='HITS@5')
    hitsAt10 = lambda annotations: metrics.hits_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 10)
        ), 10)
    metricHitsAt10 = Metric(func=hitsAt10, name='HITS@10')
    hitsAt15 = lambda annotations: metrics.hits_at_k(
        EvaluationAnalysis.binarize_annotations(
            EvaluationAnalysis.fill_results_zeros(annotations, 15)
        ), 15)
    metricHitsAt15 = Metric(func=hitsAt15, name='HITS@15')
    # Finally we define the NDCG@k metrics
    ndcgAt3 = lambda annotations: metrics.ndcg_at_k(annotations, 3)
    metricNdcgAt3 = Metric(func=ndcgAt3, name='NDCG@3')
    ndcgAt5 = lambda annotations: metrics.ndcg_at_k(annotations, 5)
    metricNdcgAt5 = Metric(func=ndcgAt5, name='NDCG@5')
    ndcgAt10 = lambda annotations: metrics.ndcg_at_k(annotations, 10)
    metricNdcgAt10 = Metric(func=ndcgAt10, name='NDCG@10')
    ndcgAt15 = lambda annotations: metrics.ndcg_at_k(annotations, 15)
    metricNdcgAt15 = Metric(func=ndcgAt15, name='NDCG@15')
    # Evaluation metrics used for the final evaluation
    metrics_eval_full = [metricAveP, metricRecipRank, metricPAt3, metricPAt5, metricPAt7, metricPAt10,
                         metricHitsAt1, metricHitsAt3, metricHitsAt5, metricHitsAt10, metricHitsAt15,
                         metricNdcgAt3, metricNdcgAt5, metricNdcgAt10, metricNdcgAt15]
    abs_path = '../webapp/gui2rapp/staticfiles/resources/'
    vis_segments = [Extractor.DATA_ACTIVITY_NAME, Extractor.DATA_TEXT_VISIBLE, Extractor.DATA_RES_IDS_VISIBLE, Extractor.DATA_ICON_IDS]
    vis_conf_full_new_filter = Configuration(path_guis=abs_path + 'combined/',
                                             path_dsls=abs_path + 'combined/',
                                             path_semantic=abs_path + 'semantic_annotations/',
                                             path_preproc_text=abs_path + 'preproc_text/',
                                             path_app_details=abs_path + 'app_details.csv',
                                             path_ui_details=abs_path + 'ui_details.csv',
                                             path_models=abs_path + 'models/new/',
                                             dir_name_prefix='new',
                                             filter_guis=True,
                                             text_segments_used=vis_segments)
    goldstandard = pd.read_csv(abs_path + '../goldstandard/goldstandard.csv')
    goldstandard.loc[:, 'gui_indexes'] = goldstandard.loc[:, 'gui_indexes'].apply(lambda x: EvaluationAnalysis.cast_annotations(x))
    goldstandard.loc[:, 'relevance'] = goldstandard.loc[:, 'relevance'].apply(lambda x: EvaluationAnalysis.cast_annotations(x))
    # Define all the ranking models employed in the evaluation
    rankers = [# Baseline ranking models
                (Ranker.R_TFIDF, vis_conf_full_new_filter),
                (Ranker.R_BM25OKAPI, vis_conf_full_new_filter),
                (Ranker.R_IWCS, vis_conf_full_new_filter),
               # Automatic Query Expansion PRF-KLD models
                (Ranker.R_PRF_KLD_BM25, vis_conf_full_new_filter),
                (Ranker.R_PRF_KLD_CAT_BM25, vis_conf_full_new_filter),
                (Ranker.R_PRF_KLD_WEIGHTED_BM25, vis_conf_full_new_filter),
                (Ranker.R_PRF_KLD_CAT_WEIGHTED_BM25, vis_conf_full_new_filter),
               # BERT baseline and BERT-LTR models
                (Ranker.R_SENTBERT, vis_conf_full_new_filter),
                (Ranker.R_BERT_POINTWISE_1, vis_conf_full_new_filter),
                (Ranker.R_BERT_PAIRWISE, vis_conf_full_new_filter),
                (Ranker.R_BERT_POINTWISE_2, vis_conf_full_new_filter),
               ]
    results = EvaluationAnalysis.run(goldstandard, rankers, metrics_eval_full)