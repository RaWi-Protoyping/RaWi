# BERT-LTR Models for NL-based GUI Ranking

In this directory, we provide several datasets that are all related to the BERT-based Learning-To-Rank models for NL-based GUI ranking. The trained BERT models are omitted due to their large size. The structure of these sub directories is explained in the following:

- **training_bert_format**: Contains the GUI ranking training data in a JSON format that is employed as the input to the BERT-based LTR models for fine-tuning
- **goldstandard_bert_format**: Contains the GUI ranking gold standard in a JSON format that is employed as the prediction input to the trained BERT-based LTR models
- **bert_01_pointwise**: Contains the ranking predictions of the (1) BERT-based pointwise LTR model on the gold standard in the JSON format and a CSV dataset that is equal to the JSON data but transformed to a GUI index ranking list
- **bert_02_pairwise**: Contains the ranking predictions of the (2) BERT-based pairwise LTR model on the gold standard in the JSON format and a CSV dataset that is equal to the JSON data but transformed to a GUI index ranking list
- **bert_03_listwise**: Contains the ranking predictions of the (3) BERT-based listwise LTR model on the gold standard in the JSON format and a CSV dataset that is equal to the JSON data but transformed to a GUI index ranking list