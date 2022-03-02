
# Training Dataset for NL-based GUI Retrieval

This dataset represents the training dataset that we created to train the BERT-based Learning-To-Rank models for NL-based GUI ranking and to foster further research on GUI retrieval. The training dataset is based on the large-scale GUI dataset Rico and contains n=350 queries each with k=30 GUIs accompanied by their relevance annotations and has the following structure:

- **query**: Represents the NL input query
- **gui_indexes**: Represents a list of GUI indexes that refer to the  GUIs of the Rico dataset. For example,  the index *55875* refers to the GUI in Rico that is denoted by the index *55875*.
- **relevance**: Represents a list of relevances for the gui_indexes on a relevancy scale of R=0 (low relevance), R=1 (medium relevance) and R=2 (high relevance). Note that the training dataset also contains relevance scores of R=3, which indicate annotation ties (i.e. each of the three relevancy scores got one vote by the annotators). For our training, we omit these instances, however, they could be handled differently. The relevance of a GUI at gui_indexes list index *i* is the respective entry at position *i* of the relevance list.