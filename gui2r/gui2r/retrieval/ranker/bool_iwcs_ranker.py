from gui2r.retrieval.ranker.ranker_v2 import Ranker
from typing import Optional, Text, List, Dict, Set, Tuple
from gui2r.retrieval.configuration.conf import Configuration
import gui2r.utils as utils
from gensim import corpora
import pandas as pd
from gensim.models import TfidfModel
from gensim.similarities import SparseMatrixSimilarity
from gui2r.preprocessing.preprocess import Preprocessor
from gui2r.preprocessing.extraction import Extractor
import logging, os, pickle
from gensim.models import KeyedVectors
import numpy as np
import scipy.spatial as spatial

logging.getLogger().setLevel(logging.INFO)


class BoolIWCSRanker(Ranker):
    """This is the implementation of the neural Bag-Of-Words (nBOW) model using pretrained word2vec embeddings and
       and TF-IDF to compute a weighted mean embedding for the documents and queries
    """

    preprocessor = Preprocessor()
    extractor = Extractor(preprocessor)

    def __init__(self, inverted_index:  Dict[Text, Set[str]],
                 bool_dictionary: List[str], conf: Configuration,
                 dictionary: corpora.Dictionary,
                 bow_corpus: corpora.MmCorpus,
                 model: TfidfModel, index: SparseMatrixSimilarity,
                 index_mapping: Dict[int, int],
                 inverse_index_mapping: Dict[int, int],
                 doc_embedding: np.array,
                 model_embedding: KeyedVectors):
        self.inverted_index = inverted_index
        self.bool_dictionary = bool_dictionary
        self.dictionary = dictionary
        self.bow_corpus = bow_corpus
        self.model = model
        self.index = index
        self.index_mapping = index_mapping
        self.inverse_index_mapping = inverse_index_mapping
        self.conf = conf
        self.doc_embedding = doc_embedding
        self.model_embedding = model_embedding

    @staticmethod
    def inverted_index(conf: Configuration, dataset: pd.DataFrame) -> Dict[Text, Set[str]]:
        path_docs = conf.path_dsls
        inv_index = {}
        for index, data in dataset.iterrows():
            text = Ranker.get_text(conf, data)
            file_name = data['filename']
            for token in text:
                if not inv_index.get(token):
                    inv_index[token] = {file_name}
                else:
                    inv_index[token].add(file_name)
        return inv_index

    def rank(self, query: Text, rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('nBOWRanker: Ranking for "{}"'.format(query))
        preproc_query = self.preprocessor.\
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        query_tokens = [word for word in preproc_query if word in self.bool_dictionary]
        result = self.get_bool_or_doc_matches(query_tokens)
        result_indexes = [int(index.split('.')[0]) for index in result]
        result_inv_indexes = [self.inverse_index_mapping[index] for index in result_indexes]
        # TFIDF model
        preproc_query_bow = self.dictionary.doc2bow(preproc_query)
        tfidf_query_bow = self.model[preproc_query_bow]
        tfidf_query_embedded, missing_words_query = BoolIWCSRanker.get_embedding(tfidf_query_bow,
                                                    self.model_embedding, self.dictionary)
        rankings = self.get_ranking_over_doc_matches(result_inv_indexes, tfidf_query_embedded)
        rankings_inv_indexes = [(self.index_mapping[index], sim) for index, sim in rankings]
        return rankings_inv_indexes[:min(len(result_indexes), rank_cutoff)]

    def rank_gs(self, query: Text, goldstandard: Set[int], rank_threshold: Optional[float] = 0.0,
             rank_cutoff: Optional[int] = 100) -> List[Tuple[int, float]]:
        logging.info('nBOWRanker: Ranking for "{}"'.format(query))
        preproc_query = self.preprocessor. \
            preprocess_text(query, tokenized=True, remove_stopwords=self.conf.preprocesing_rm_stopwords,
                            stemmed=self.conf.preprocesing_stemmed,
                            stemming=self.conf.preprocessing_stemmer)
        query_tokens = [word for word in preproc_query if word in self.bool_dictionary]
        result = self.get_bool_or_doc_matches(query_tokens)
        result_indexes = [int(index.split('.')[0]) for index in result]
        result_inv_indexes = [self.inverse_index_mapping[index] for index in result_indexes]
        # TFIDF model
        preproc_query_bow = self.dictionary.doc2bow(preproc_query)
        tfidf_query_bow = self.model[preproc_query_bow]
        tfidf_query_embedded, missing_words_query = BoolIWCSRanker.get_embedding(tfidf_query_bow,
                                                     self.model_embedding, self.dictionary)
        rankings = self.get_ranking_over_doc_matches(result_inv_indexes, tfidf_query_embedded)
        rankings_inv_indexes = [(self.index_mapping[index], sim) for index, sim in rankings]
        init_result = [(index, conf) for index, conf in rankings_inv_indexes if index in goldstandard]
        remains = [(elem, 1) for elem in goldstandard if elem not in init_result]
        return init_result + remains

    def get_ranking_over_doc_matches(self, doc_indexes: List[int], query_embedded: np.array) \
            -> List[Tuple[int, float]]:
        query_embedded_reshaped = query_embedded.reshape(1,-1)
        relevant_corpus = self.doc_embedding[doc_indexes, :]
        distances = spatial.distance.cdist(relevant_corpus, query_embedded_reshaped, 'cosine')
        similarities = 1 - distances
        results = [(index, similarities[enum_index][0]) for enum_index, index in enumerate(doc_indexes)]
        results_sorted = [(k,v) for k, v in sorted(results, key=lambda item: item[1], reverse=True)]
        return results_sorted

    def get_bool_or_doc_matches(self, query_tokens: List[Text]) -> Set[Text]:
        result = None
        for word in query_tokens:
            if result is None:
                result = self.inverted_index.get(word)
            else:
                intermediate_results = self.inverted_index.get(word)
                result = result.union(intermediate_results)
        return result

    @staticmethod
    def get_embedding(tfidf_words: List[Tuple[int, float]], embedding: KeyedVectors,
                      id2word: corpora.Dictionary) -> Tuple[np.array, List[Text]]:
        missing_words = []
        embeds = []
        doc_embed = np.zeros(embedding.vector_size)
        for word_index, weight in tfidf_words:
            word = id2word[word_index]
            if word in embedding.vocab:
                word_embed = embedding[word]
                embeds.append(word_embed)
                doc_embed += word_embed * weight
            else:
                missing_words.append(word)
        return doc_embed, missing_words

    @staticmethod
    def embed_corpus(tfidf_corpus: List[List[Tuple[int, float]]], embedding: KeyedVectors,
                      id2word: corpora.Dictionary) -> np.array:
        return np.array([BoolIWCSRanker.get_embedding(doc, embedding, id2word)[0] for doc in tfidf_corpus])

    def persist(self, path: Optional[Text]) -> None:
        with open(path + 'dictionary.txt', mode='w') as file:
            for word in self.bool_dictionary:
                file.write(word + '\n')
        with open(path + 'inverted_index.pickle', mode='wb') as file:
            pickle.dump(self.inverted_index, file)
        self.dictionary.save(path + 'dict.dictionary')
        corpora.MmCorpus.serialize(path + 'corpus.mm', self.bow_corpus)
        self.model.save(path + 'tfidf.model')
        self.index.save(path + 'tfidf.index')
        with open(path + 'index_mapping.pickle', mode='wb') as file:
            pickle.dump(self.index_mapping, file)
        with open(path + 'inverse_index_mapping.pickle', mode='wb') as file:
            pickle.dump(self.inverse_index_mapping, file)
        np.save(path + 'doc_embedding.npy', self.doc_embedding)


    @staticmethod
    def load(conf: Configuration, force: Optional[bool] = False,
             persist: Optional[bool] = True) -> "BoolIWCSRanker":
        model_path = conf.path_models + 'bool_iwcs/' + conf.get_desc() + '/'
        if force or (not os.path.exists(model_path)) or \
                (not os.path.isfile(model_path + 'inverted_index.pickle')) \
                 or (not os.path.isfile(model_path + 'corpus.mm')) \
                 or (not os.path.isfile(model_path + 'tfidf.model')):
            utils.mk_dir_if_not_exists(model_path)
            # Create the TFIDF model and dictionary
            dataset = BoolIWCSRanker.extractor.load_dataset(conf=conf)
            dictionary = corpora.Dictionary([Ranker.get_text(conf, data) for (index, data) in dataset.iterrows()])
            bow_corpus = [(dictionary.doc2bow(Ranker.get_text(conf, data)), data['filename'])
                          for (index, data) in dataset.iterrows()]
            bow_corpus, names = map(list, zip(*bow_corpus))
            index_mapping = BoolIWCSRanker.build_index_mapping(names)
            inverse_index_mapping = BoolIWCSRanker.build_inverse_index_mapping(names)
            corpora.MmCorpus.serialize(model_path + 'corpus.mm', bow_corpus)
            mm_corpus = corpora.MmCorpus(model_path + 'corpus.mm')
            tfidf_model = TfidfModel(mm_corpus, )
            tfidf_index = SparseMatrixSimilarity(tfidf_model[mm_corpus], num_features=mm_corpus.num_terms)
            logging.info('nBOWRanker : TFIDF initialized')
            logging.info('nBOWRanker : TFIDF model : {}'.format(tfidf_model))
            logging.info('nBOWRanker : TFIDF index : {}'.format(tfidf_index))
            # Create boolean index
            inverted_index = BoolIWCSRanker.inverted_index(conf, dataset)
            bool_dictionary = inverted_index.keys()
            # Load word2vec embedding and embed the corpus
            word2vec = KeyedVectors.load_word2vec_format('../resources/embeddings/GoogleNews-vectors-negative300.bin', binary=True)
            tfidf_corpus = [tfidf_model[doc] for doc in bow_corpus]
            doc_embedding = BoolIWCSRanker.embed_corpus(tfidf_corpus, word2vec, dictionary)
            logging.info('nBOWRanker : Embedded docs shape : {}'.format(doc_embedding.shape))
            ranker = BoolIWCSRanker(inverted_index, bool_dictionary, conf,
                                    dictionary, bow_corpus, tfidf_model,
                                    tfidf_index, index_mapping, inverse_index_mapping,
                                    doc_embedding=doc_embedding, model_embedding=word2vec)
            ranker.persist(model_path)
            return ranker
        else:
            dictionary = corpora.Dictionary.load(model_path + 'dict.dictionary')
            mm_corpus = corpora.MmCorpus(model_path + 'corpus.mm')
            tfidf_model = TfidfModel.load(model_path + 'tfidf.model')
            tfidf_index = SparseMatrixSimilarity.load(model_path + 'tfidf.index')
            with open(model_path + 'index_mapping.pickle', mode='rb') as file:
                index_mapping = pickle.load(file)
                logging.info('nBOWRanker : TFIDF indexmap initialized')
            with open(model_path + 'inverse_index_mapping.pickle', mode='rb') as file:
                inverse_index_mapping = pickle.load(file)
                logging.info('nBOWRanker : TFIDF invindexmap initialized')
            with open(model_path + 'inverted_index.pickle', mode='rb') as file:
                inverted_index = pickle.load(file)
                bool_dictionary = inverted_index.keys()
            doc_embedding = np.load(model_path + 'doc_embedding.npy')
            logging.info('nBOWRanker : Doc embeddings loaded')
            word2vec = KeyedVectors.load_word2vec_format('../resources/embeddings/GoogleNews-vectors-negative300.bin', binary=True)
            logging.info('nBOWRanker : Embedding model loaded')
            return BoolIWCSRanker(inverted_index, bool_dictionary, conf,
                                    dictionary, mm_corpus, tfidf_model,
                                    tfidf_index, index_mapping, inverse_index_mapping,
                                    doc_embedding=doc_embedding, model_embedding=word2vec)

    @staticmethod
    def build_index_mapping(names: List[Text]) -> Dict[int, int]:
        mapping ={}
        for index, name in enumerate(names):
            mapping[index] = int(name.split('.')[0])
        return mapping

    @staticmethod
    def build_inverse_index_mapping(names: List[Text]) -> Dict[int, int]:
        mapping ={}
        for index, name in enumerate(names):
            mapping[int(name.split('.')[0])] = index
        return mapping

    def get_name(self):
        return Ranker.R_IWCS