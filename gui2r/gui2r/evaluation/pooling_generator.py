from typing import Text, Optional, List
import pandas as pd
import logging
from pathlib import Path
import shutil

from gui2r.preprocessing.extraction import Extractor
from gui2r.retrieval.retriever import Retriever
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.retrieval.ranker.vsm_tfidf_ranker import TFIDFRanker
from gui2r.retrieval.ranker.bm25okapi_ranker import BM25OkapiRanker
from gui2r.retrieval.ranker.bool_iwcs_ranker import BoolIWCSRanker
import logging

logging.getLogger().setLevel(logging.INFO)


class PoolingGenerator(object):
    """This class is used to generate the top-30 potentially relevant GUIs according to the three baseline models
       TF-IDF, BM25 and nBOW. The results are later then pooled in a Jupyter Notebook to be annotated in Mechanical Turk.
    """

    @staticmethod
    def get_ranker_instance(ranker: Text, config: Configuration) -> Ranker:
        if ranker == Ranker.R_TFIDF: return TFIDFRanker.load(config)
        if ranker == Ranker.R_BM25OKAPI: return BM25OkapiRanker.load(config)
        if ranker == Ranker.R_IWCS: return BoolIWCSRanker.load(config)

    def generate(self, max_k: int, ranker_name: Text, config: Configuration,
                 queries: List["EvaluationQuery"], imgs_dest: Optional[Text] = None):
        logging.info('Generating top-{} rankings for {} queries with {}'.format(max_k, len(queries), ranker_name))
        ranker = PoolingGenerator.get_ranker_instance(ranker_name, config)
        ranked_results = []
        all_ranks = []
        for index, query in enumerate(queries):
            retriever = Retriever(config, {ranker.get_name(): ranker})
            docs = retriever.rank(query.text, method=ranker.get_name(), max_results=max_k)
            ranks = [ranked_doc.document.index for ranked_doc in docs]
            if len(ranks) != max_k:
                logging.error("Returned {} for top-{} request for query {}".format(len(ranks), max_k, query))
            ranked_results.append(EvaluationResult(eval_query=query, ranked_docs=ranks,
                                  ranker_name=ranker.get_name(), config=config))
            all_ranks.extend(ranks)
        if imgs_dest:
            all_ranks = list(set(all_ranks))
            self.copy_all_images_for_batch(rankings=all_ranks, path_src=config.path_guis, path_dest=imgs_dest)
        return ranked_results

    def copy_all_images_for_batch(self, rankings: List[int], path_src: Text, path_dest: Text) -> None:
        image_path = path_dest + "/images/"
        Path(image_path).mkdir(parents=True, exist_ok=True)
        for index in rankings:
            file_name = str(index) + ".jpg"
            shutil.copyfile(path_src+file_name, image_path+file_name)
        return None


class EvaluationQuery(object):

    def __init__(self, id: int, text: Text, gui_index: Optional[int], worker_id: Optional[Text]):
        self.id = id
        self.text = text
        self.gui_index = gui_index
        self.worker_id = worker_id

    @staticmethod
    def load_from_csv(path: Text) -> List["EvaluationQuery"]:
        evaluation_queries = pd.read_csv(path, skipinitialspace = True, quotechar='"')
        queries = []
        logging.info(evaluation_queries)
        for index, row in evaluation_queries.iterrows():
            queries.append(EvaluationQuery(row[0], row[1], row[2], row[3]))
        return queries

    def __repr__(self):
        return 'Query = id: {}, text: {}, gui_index: {}, worker_id: {}'.\
            format(self.id, self.text, self.gui_index, self.worker_id)


class EvaluationResult(object):

    def __init__(self, eval_query: EvaluationQuery, ranked_docs, ranker_name: Text, config: Configuration):
        self.eval_query = eval_query
        self.ranked_docs = ranked_docs
        self.ranker_name = ranker_name
        self.config = config

    def to_dict(self):
        base_dict = {
            'id': self.eval_query.id,
            'query': self.eval_query.text
        }
        for index, ranked_doc in enumerate(self.ranked_docs, 1):
            base_dict["gui_index_" + str(index)] = str(ranked_doc)
        base_dict['gui_index_' +  str(len(self.ranked_docs)+1)] = str(self.eval_query.gui_index)
        return base_dict

    def to_dict_simple(self):
        base_dict = {
            'id': self.eval_query.id,
            'query': self.eval_query.text
        }
        for index, ranked_doc in enumerate(self.ranked_docs, 1):
            base_dict["gui_index_" + str(index)] = str(ranked_doc)
        return base_dict

    def to_dict_guis_list(self):
        return {
            'id': self.eval_query.id,
            'query': self.eval_query.text,
            'ranked_guis': self.ranked_docs + [int(self.eval_query.gui_index)]
        }


abs_path = '../resources/'
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


def run_generator_simple(ranker_name: Text, queries: List[EvaluationQuery], imgs_dest: Optional[Text] = None):
    conf = vis_conf_full_new_filter
    pooling_generator = PoolingGenerator()
    return pooling_generator.generate(max_k=30, ranker_name=ranker_name, config=conf, queries=queries, imgs_dest=imgs_dest)


if __name__ == '__main__':
    abs_path_base = '../goldstandard_batch_1/03_query_sampled/'
    abs_path = '../goldstandard_batch_1/04_baseline_rankings/'
    # Load queries from CSV dataset
    queries = EvaluationQuery.load_from_csv(abs_path_base + 'goldstandard_qgw.csv')
    ranker_name = Ranker.R_BM25OKAPI
    Path(abs_path + ranker_name).mkdir(parents=True, exist_ok=False)
    # Define the pooling generator
    results = run_generator_simple(ranker_name=ranker_name, queries=queries, imgs_dest=abs_path + ranker_name)
    simple_results = pd.DataFrame.from_records([result.to_dict_guis_list() for result in results])
    simple_results.to_csv(abs_path + ranker_name + "/rankings_" + ranker_name + ".csv", index=False)