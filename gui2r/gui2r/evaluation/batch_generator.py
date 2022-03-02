from typing import List, Text, Optional, Tuple
from random import seed, sample
import pandas as pd
from pathlib import Path
import shutil
import os

import logging

logging.getLogger().setLevel(logging.INFO)


class BatchGenerator(object):

    def __init__(self, path_images: Text, path_dest: Text, rand_seed: Optional[int] = None,
                 scan_for_batches: Optional[bool] = True, batch_prefix: Optional[Text] = "batch"):
        self.path_images = path_images
        self.path_dest = path_dest
        self.scan_for_batches = scan_for_batches
        self.batch_prefix = batch_prefix
        if rand_seed:
            seed(rand_seed)

    def generate_batch(self, n: int) -> List[int]:
        population = self.get_populuation_ids()
        logging.info("Sampling {} from population: #Elems: {}".format(n, len(population)))
        # Check if there are already previous batches to exclude from
        next_id = 1
        if self.scan_for_batches:
            exlusion_ids, batch_ids, next_id = self.get_ids_from_previous_batches()
            population = list(set(population).difference(set(exlusion_ids)))
        batch_sample = sample(population, n)
        logging.info("Sampled Batch: #Elems:{}, Elems: {}".format(len(batch_sample), batch_sample))
        # Create new folder for generated batch and create all files
        batch_id = "batch_" + str(next_id)
        batch_path = self.path_dest + batch_id
        Path(batch_path).mkdir(parents=True, exist_ok=False)
        # Create CSV for batch ids and save it to the new batch folder
        batch_csv = pd.DataFrame(batch_sample, columns=["gui_index"])
        logging.info("Saving CSV to {}".format(batch_path))
        batch_csv.to_csv(batch_path + "/" + batch_id + ".csv", index=False)
        # Create new folder for images in batch dir and copy all images
        logging.info("Copying {} images from {} to {}".format(len(batch_sample), self.path_images, batch_path))
        self.copy_all_images_for_batch(batch_sample, batch_path)
        logging.info("Generating batch completed")
        return batch_sample

    def copy_all_images_for_batch(self, batch_sample: List[int], batch_path: Text) -> None:
        batch_image_path = batch_path+"/images/"
        Path(batch_image_path).mkdir(parents=True, exist_ok=True)
        for index in batch_sample:
            file_name = str(index) + ".jpg"
            shutil.copyfile(self.path_images+file_name, batch_image_path+file_name)
        return None

    def get_ids_from_previous_batches(self) -> Tuple[List[int], List[int], int]:
        batch_names = ([name for name in os.listdir(self.path_dest)])
        if not batch_names:
            return [], [], 1
        else:
            # Scan all batch names and extract numbers
            batch_ids = [int(name.split("_")[1]) for name in batch_names]
            exclusion_ids = []
            for batch_name in batch_names:
                batch_csv = pd.read_csv(self.path_dest+batch_name+"/"+batch_name+".csv")
                batch_as_list = batch_csv["gui_index"].values.tolist()
                exclusion_ids += batch_as_list
            # If exclusion ids would have different length after set operation, they are not independent
            exclusion_ids = list(set(exclusion_ids))
            logging.info("Exclusion ids : {}".format(exclusion_ids))
            return exclusion_ids, batch_ids, (max(batch_ids)+1)

    def get_populuation_ids(self) -> List[int]:
        return self.get_population_ids_from_dataset()

    def get_population_ids_from_dataset(self) -> List[int]:
        path_dataset = '../resources/preproc_text/dataset_new_stem_F_stpw_T_filter_T.csv'
        dataframe = pd.read_csv(path_dataset)
        dataframe["gui_index"] = dataframe["filename"].apply(lambda name: name.split(".")[0])
        return dataframe["gui_index"].values.tolist()


if __name__ == "__main__":
    abs_path_resources = '../resources/'
    abs_path_images = abs_path_resources + 'combined/'
    abs_path_dest =  abs_path_resources + 'mturk/batches/'
    generator = BatchGenerator(path_images=abs_path_images, path_dest=abs_path_dest)
    generator.generate_batch(n=500)