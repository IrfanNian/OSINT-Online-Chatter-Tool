import os
import pandas as pd
import glob

CWD = os.getcwd()
RESULT_FOLDER = "results"


class CSVReader:
    def get_csv_files(self):
        """
        Opens a csv file and reads it into memory
        :return all_csv_files:
        """
        directory = os.path.join(CWD, "..", RESULT_FOLDER)
        all_csv_files = glob.glob(os.path.join(directory, "*.csv"))
        return all_csv_files

    def csv_to_df(self, arg_csv_filenames):
        """
        Converts all csv in the results folder into dataframes and compile them
        :param arg_csv_filenames:
        :return compiled_df:
        """
        compiled_df = pd.DataFrame(columns=["time", "text", "user"])
        for filename in arg_csv_filenames:
            # open and read the file to df
            df = pd.read_csv(filename, index_col=None)
            compiled_df = pd.concat([compiled_df, df], ignore_index=True)
        compiled_df.to_csv("test.csv")  # debugging code, remove later
        return compiled_df

    def run(self):
        """
        Runs the csv reader module
        :return compiled_df:
        """
        csv_filenames = self.get_csv_files()
        compiled_df = self.csv_to_df(csv_filenames)
        return compiled_df


# debugging code, remove later
if __name__ == '__main__':
    test = CSVReader()
    test.run()
