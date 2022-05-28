import os
import threading
import pandas as pd
import glob
import datetime as dt

CWD = os.getcwd()
RESULT_FOLDER = "results"


class FeatherReader:
    def get_feather_files(self):
        """
        Opens a csv file and reads it into memory
        :return all_csv_files:
        """
        directory = os.path.join(CWD, RESULT_FOLDER)
        all_feather_files = glob.glob(os.path.join(directory, "*.feather"))
        return all_feather_files

    def _save_as_csv(self, arg_df):
        """
        Saves the compiled dataframe as csv
        :param arg_df:
        :return None:
        """
        ts = dt.datetime.now().timestamp()
        arg_df.to_csv(os.path.join(CWD, RESULT_FOLDER, "results_compiled_" + str(ts) + ".csv"), sep=",", index=False)

    def save_as_csv(self, arg_df):
        """
        Wrapper function
        :param arg_df:
        :return None:
        """
        threading.Thread(target=self._save_as_csv(arg_df)).start()

    def feather_to_df(self, arg_feather_filenames):
        """
        Converts all csv in the results folder into dataframes and compile them
        :param arg_feather_filenames:
        :return compiled_df:
        """
        compiled_df = pd.DataFrame(columns=["time", "text", "user"])
        for filename in arg_feather_filenames:
            # open and read the file to df
            df = pd.read_feather(filename)
            compiled_df = pd.concat([compiled_df, df], ignore_index=True)
        return compiled_df

    def run(self):
        """
        Runs the csv reader module
        :return compiled_df:
        """
        feather_filenames = self.get_feather_files()
        compiled_df = self.feather_to_df(feather_filenames)
        self.save_as_csv(compiled_df)
        return compiled_df
