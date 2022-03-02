# GUI Ranking Datasets

This directory contains mainly the evaluation datasets used for our NL-based GUI ranking.  Note that datasets such as  Rico are omitted due to their size and their public availability. The structure of the directory is as follows:

- **mturk**: Contains the raw datasets of our crowdsourced data collection pipeline separated in two batches that we collected on Amazon Mechanical Turk consecutively
- **goldstandard**: Contains the created GUI retrieval gold standard used in our evaluation which is publicly released to foster further NL-based GUI retrieval research
- **training**: Contains the created training dataset that we employed to train multiple BERT-based Learning-To-Rank models for NL-based GUI ranking
- **bert_models**: Contains the gold standard and training datasets transformed to the input format required by the BERT-LTR models and the predictions obtained with the three considered BERT-LTR models