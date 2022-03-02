from typing import Text


class Document():

    def __init__(self, index: Text, ui_path: Text, name: Text):
        self.index = index
        self.ui_path = ui_path
        self.name = name

    def __repr__(self):
        return 'Document = index: {}, ui_path: {}, name: {}'.\
            format(self.index, self.ui_path, self.name)


class RankedDocument():

    def __init__(self, document: Document, rank: float, conf: float):
        self.document = document
        self.rank = rank
        self.conf = conf

    def __repr__(self):
        return 'RankedDocument = document {}, rank: {}, conf: {}'.\
            format(self.document, self.rank, self.conf)