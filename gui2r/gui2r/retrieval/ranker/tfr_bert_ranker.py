from typing import Text, List, Optional, Tuple, Set
from gui2r.retrieval.ranker.ranker_v2 import Ranker
from gui2r.retrieval.configuration.conf import Configuration
import pandas as pd
from ast import literal_eval

import logging

logging.getLogger().setLevel(logging.INFO)


class TFRBertRanker(Ranker):
    """Note: This is a placeholder class for the BERT-LTR ranking models. The models are trained outside of this framework
       using the Tensorflow-Ranking BERT-Extension and the predictions are read from the generated prediction files in this
       Ranker to fit in our evaluation framework. When asked for the GUI rankings for a query from the gold standard, this
       Ranker will simply return the ranking read from the generated prediction files. The generated predictions can be found
       at /data/gui_ranking/bert_models/
    """
    LOSS_01_POINTWISE_1 = 'tfr-bert (loss_pointwise)'
    LOSS_02_PAIRWISE = 'tfr-bert (loss_pairwise)'
    LOSS_03_POINTWISE_2 = 'tfr-bert (loss_pointwise_softmax)'

    def __init__(self, model: Text):
        self.model = model
        if model == TFRBertRanker.LOSS_01_POINTWISE_1:
            # Read the generated predictions for the BERT-LTR (pointwise) model
            # We trained the model outside of this framework using the command line interface to the Tensorflow-Ranking BERT-Extension
            # To train this model we set the following command and hyperparameters
            # bazel build -c opt \
			# tensorflow_ranking/extension/examples:tfrbert_example_py_binary && \
			# ./bazel-bin/tensorflow_ranking/extension/examples/tfrbert_example_py_binary \
			#    --train_input_pattern=${DATA_DIR}/train.guiranking_full.elwc.tfrecord \
			#    --eval_input_pattern=${DATA_DIR}/train.guiranking_full.elwc.tfrecord \
			#    --bert_config_file=${BERT_DIR}/bert_config.json \
			#    --bert_init_ckpt=${BERT_DIR}/bert_model.ckpt \
			#    --bert_max_seq_length=128 \
			#    --model_dir="${OUTPUT_DIR}" \
			#    --list_size=15 \
			#    --loss=sigmoid_cross_entropy_loss \
			#    --train_batch_size=1 \
			#    --eval_batch_size=1 \
			#    --learning_rate=1e-5 \
			#    --num_train_steps=30000 \
			#    --num_eval_steps=10 \
			#    --checkpoint_secs=500 \
			#    --num_checkpoints=2
            self.predictions = pd.read_csv('../bert_01_pointwise_1/predictions.csv')
        elif model == TFRBertRanker.LOSS_02_PAIRWISE:
            # Read the generated predictions for the BERT-LTR (pairwise) model
            # We trained the model outside of this framework using the command line interface to the Tensorflow-Ranking BERT-Extension
            # To train this model we set the following command and hyperparameters
            # bazel build -c opt \
			# tensorflow_ranking/extension/examples:tfrbert_example_py_binary && \
			# ./bazel-bin/tensorflow_ranking/extension/examples/tfrbert_example_py_binary \
			#    --train_input_pattern=${DATA_DIR}/train.guiranking_full.elwc.tfrecord \
			#    --eval_input_pattern=${DATA_DIR}/train.guiranking_full.elwc.tfrecord \
			#    --bert_config_file=${BERT_DIR}/bert_config.json \
			#    --bert_init_ckpt=${BERT_DIR}/bert_model.ckpt \
			#    --bert_max_seq_length=128 \
			#    --model_dir="${OUTPUT_DIR}" \
			#    --list_size=15 \
			#    --loss=pairwise_logistic_loss \
			#    --train_batch_size=1 \
			#    --eval_batch_size=1 \
			#    --learning_rate=1e-5 \
			#    --num_train_steps=30000 \
			#    --num_eval_steps=10 \
			#    --checkpoint_secs=500 \
			#    --num_checkpoints=2
            self.predictions = pd.read_csv('../bert_02_pairwise/predictions.csv')
        elif model == TFRBertRanker.LOSS_03_POINTWISE_2:
            # Read the generated predictions for the BERT-LTR (pointwise) model
            # We trained the model outside of this framework using the command line interface to the Tensorflow-Ranking BERT-Extension
            # To train this model we set the following command and hyperparameters
            # bazel build -c opt \
			# tensorflow_ranking/extension/examples:tfrbert_example_py_binary && \
			# ./bazel-bin/tensorflow_ranking/extension/examples/tfrbert_example_py_binary \
			#    --train_input_pattern=${DATA_DIR}/train.guiranking_full.elwc.tfrecord \
			#    --eval_input_pattern=${DATA_DIR}/train.guiranking_full.elwc.tfrecord \
			#    --bert_config_file=${BERT_DIR}/bert_config.json \
			#    --bert_init_ckpt=${BERT_DIR}/bert_model.ckpt \
			#    --bert_max_seq_length=128 \
			#    --model_dir="${OUTPUT_DIR}" \
			#    --list_size=15 \
			#    --loss=softmax_loss \
			#    --train_batch_size=1 \
			#    --eval_batch_size=1 \
			#    --learning_rate=1e-5 \
			#    --num_train_steps=30000 \
			#    --num_eval_steps=10 \
			#    --checkpoint_secs=500 \
			#    --num_checkpoints=2
            self.predictions = pd.read_csv('../bert_03_pointwise_2/predictions.csv')
        self.predictions.loc[:, 'gui_ranking'] =  self.predictions.loc[:, 'gui_ranking'].apply(lambda x: literal_eval(x))

    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        pass

    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        results = self.predictions[self.predictions['query'] == query]['gui_ranking'].values.tolist()[0]
        if not results or len(results) != 20:
            raise ValueError('Exception in TFR-BERT with query <{}>, results: {}'.format(query, results))
        return [(elem, 1) for elem in results]

    def persist(self, path: Optional[Text]) -> None:
        pass

    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True, model: Optional[Text] = 'tfr-bert (loss_pointwise_softmax)') -> "TFRBertRanker":
        return TFRBertRanker(model=model)

    def get_name(self):
        return self.model