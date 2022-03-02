# Gold Standard for NL-based GUI Retrieval

This dataset represents the gold standard that we created to evaluate our NL-based GUI retrieval models and to foster further research on GUI retrieval. The gold standard is based on the large-scale GUI dataset Rico and contains n=100 queries each with k=20 GUIs accompanied by their relevance annotations and has the following structure:

- **query**: Represents the NL input query
- **gui_indexes**: Represents a list of GUI indexes that refer to the  GUIs of the Rico dataset. For example,  the index *55875* refers to the GUI in Rico that is denoted by the index *55875*.
- **relevance**: Represents a list of relevances for the gui_indexes on a relevancy scale of R=0 (low relevance), R=1 (medium relevance) and R=2 (high relevance). The relevance of a GUI at gui_indexes list index *i* is the respective entry at position *i* of the relevance list.