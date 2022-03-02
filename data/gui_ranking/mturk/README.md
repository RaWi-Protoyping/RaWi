# Raw Datasets from our Crowdsourced Data Collection Pipeline

In this directory, we provide the GUI relevancy examples with a description of our relevancy scale (denoted by *relevance*) and our raw datasets from our crowdsourced data collection pipeline. To collect the GUI ranking datasets, we initially collected NL queries and then collected relevance annotations in two rounds (denoted by *goldstandard_batch_1* and *goldstandard_batch_2*). Each batch contains the following datasets based on the steps in the collection pipeline:

- **02_query_results**: Contains the NL query datasets separated in four batch files. These datasets are equal in both of the relevance annotation batches.
- **03_query_sampled**: Contains the sampled queries for this gold standard batch
- **04_baseline_rankings**: Contains the top-30 GUI retrieval results obtained for the sampled queries using our three baseline models TF-IDF, BM25 and nBOW. The retrieval results are respective GUI indexes from the GUIs contained in the Rico dataset. In addition, it contains the pooled dataset that was used as input to Mechanical Turk to collect relevance annotations.
- **05_relevance_annotations**: Contains the relevance annotations for the previously created pooled GUI results obtained from Mechanical Turk
- **06_final_dataset**: Contains a processed version of the relevance annotations obtained from Mechanical Turk that acts as input to get the final gold standard and training datsets