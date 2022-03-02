# GUI Retrieval Overview

  

In this part of the repository, we provide all code files of our Python-based GUI retrieval framework. This includes the different GUI retrieval models and the GUI retrieval evaluation pipeline presented in the paper. In the following, we provide a brief description of the different packages contained in the GUI retrieval code submission:

  

-  **preprocessing**: Contains the Python scripts that are related to text preprocessing (preprocess.py), text extraction (extraction.py) and filtering (filter.py)

-  **retrieval**: Contains all Python scripts implementing the different retrieval functions and the main script (retriever.py)

	-  **configuration**: Contains the configuration class to set and save different configuration settings

	-  **ranker**: Contains the implementations for the different IR ranking methods (TF-IDF, BM25, nBOW). In addition, it contains the weighted variants of the BM25 ranking model. However, the BERT-LTR models are trained outside of this framework using the Tensorflow-Ranking BERT-Extension and the predictions are read from the generated prediction files in a Ranker to fit in our evaluation framework.

	-  **query_expansion**: Contains the four different PRF-KLD AQE methods based on the BM25 base ranking model

-  **evaluation**: Contains the Python scripts used for the evaluation of our approach. In particular, it contains the ranking metrics implementations used to compute the ranking metric values *AveP*, *MRR*, *P@k*, *HITS@k* and the *NDCG@k* (rank_metrics.py). In addition, it contains the script for computing the results for the considered ranking models over the GUI retrieval gold standard (analysis.py). For the creation of the gold standard, it contains the Python script to randomly sample GUIs from the Rico dataset as the basis for writing queries (batch_generator.py) and the Python script to compute the top-k retrieval results from the ranking models (pooling_generator.py).

- **resources**: Contains the downloading and installation guides for the necessary resource files employed in our approach. Due to the large size of the respective resource files, we needed to omit them in this repository. However, all of these files are publicly available such as all files related to Rico GUIs, pretrained dense word embeddings (word2vec) and the pretrained BERT-base language model.