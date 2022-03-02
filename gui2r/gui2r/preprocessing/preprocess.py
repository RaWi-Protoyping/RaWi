from typing import Text, List, Optional
from nltk.corpus import stopwords as stopw
from nltk.corpus import LazyCorpusLoader
from nltk.tokenize import word_tokenize
from nltk.tokenize.treebank import TreebankWordDetokenizer
from nltk.tokenize.api import TokenizerI
from nltk.stem import SnowballStemmer
from abc import ABC, abstractmethod
import re
from krovetzstemmer import Stemmer


class Tokenizer(ABC):

    @abstractmethod
    def tokenize(self, text: Text) -> List[Text]:
        raise NotImplementedError


class SimpleTokenizer(Tokenizer):

    def __init__(self, language: Optional[Text] = 'english'):
        self.language = language

    def tokenize(self, text: Text) -> List[Text]:
        return word_tokenize(text, self.language)


class Stemming(ABC):

    SNOWBALL = 'snowball'
    KROVETZ = ' krovetz'

    @abstractmethod
    def stem(self, text: Text) -> Text:
        raise NotImplementedError

    @staticmethod
    def get_stemmer(text: Text):
        if text == Stemming.SNOWBALL:
            return SnowBallStemmer('english')
        elif text == Stemming.KROVETZ:
            return KrovetzStemmer()


class SnowBallStemmer(Stemming):

    def __init__(self, language: Optional[Text] = 'english'):
        self.stemmer = SnowballStemmer(language=language)

    def stem(self, text: Text) -> Text:
        return self.stemmer.stem(text)


class KrovetzStemmer(Stemming):

    def __init__(self):
        self.stemmer = Stemmer()

    def stem(self, text: Text) -> Text:
        return self.stemmer.stem(text)


class Preprocessor(object):

    def __init__(self, tokenizer: Optional[TokenizerI] = SimpleTokenizer(),
                 detokenizer: Optional[TokenizerI] = TreebankWordDetokenizer(),
                 stopwords: LazyCorpusLoader = stopw):
        self.tokenizer = tokenizer
        self.detokenizer = detokenizer
        self.stopwords = stopwords.words(tokenizer.language)

    def preprocess_text(self, text: Text, tokenized: Optional[bool] = False,
                        stemmed: Optional[bool] = False,
                        stemming: Optional[Text] = Stemming.KROVETZ,
                        remove_numeric: Optional[bool] = True,
                        remove_non_utf8: Optional[bool] = True,
                        remove_stopwords: Optional[bool] = False) -> List[Text]:
        preproc_text = text.lower()
        preproc_text = preproc_text.replace("’", "'")
        preproc_text = preproc_text.replace("“", '"')
        preproc_text = preproc_text.replace("”", '"')
        preproc_text = preproc_text.strip()
        tokenized_text = self.tokenizer.tokenize(preproc_text)
        if remove_stopwords:
            tokenized_text = [word for word in tokenized_text
                               if word not in self.stopwords]
        if stemmed:
            stemmer = Stemming.get_stemmer(stemming)
            tokenized_text = [stemmer.stem(token)
                              for token in tokenized_text]
        if remove_numeric:
            tokenized_text = [token for token in tokenized_text
                              if Preprocessor.is_alpha(token)]
        if remove_non_utf8:
            tokenized_text = [token for token in tokenized_text
                              if Preprocessor.is_utf8(token)]
        return tokenized_text if tokenized else \
                [self.detokenizer.detokenize(tokenized_text)]

    @staticmethod
    def is_alpha(text: Text) -> bool:
        return bool(re.match('[a-zA-Z]', str(text)))

    @staticmethod
    def is_utf8(text: Text) -> bool:
        try:
            str(text).encode(encoding='utf-8').decode('ascii')
        except UnicodeDecodeError:
            return False
        else:
            return True