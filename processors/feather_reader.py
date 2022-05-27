import os
import pandas as pd
import glob

CWD = os.getcwd()
RESULT_FOLDER = "results"


class FeatherReader:
    def get_feather_files(self):
        """
        Opens a csv file and reads it into memory
        :return all_csv_files:
        """
        directory = os.path.join(CWD, "..", RESULT_FOLDER)
        all_feather_files = glob.glob(os.path.join(directory, "*.feather"))
        return all_feather_files

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
        compiled_df.to_csv("test.csv")  # debugging code, remove later
        return compiled_df

    def run(self):
        """
        Runs the csv reader module
        :return compiled_df:
        """
        feather_filenames = self.get_feather_files()
        compiled_df = self.feather_to_df(feather_filenames)
        return compiled_df


# debugging code, remove later
if __name__ == '__main__':
    test = FeatherReader()
    test.run()
