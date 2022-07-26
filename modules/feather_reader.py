import os
import pandas as pd
import glob

CWD = os.getcwd()
RESULT_FOLDER = "results"
STATIC_RESULT_FOLDER = os.path.join("static", "results")
UPLOAD_FOLDER = os.path.join("static", "uploads")


class FeatherReader:
    def get_feather_files(self, arg_keyword):
        """
        Opens a feather file and reads it into memory
        :return all_csv_files:
        """
        result_directory = os.path.join(CWD, RESULT_FOLDER)
        upload_directory = os.path.join(CWD, UPLOAD_FOLDER)
        all_result_feather_files = glob.glob(os.path.join(result_directory, arg_keyword))
        all_upload_feather_files = glob.glob(os.path.join(upload_directory, arg_keyword))
        all_feather_files = all_result_feather_files + all_upload_feather_files
        return all_feather_files

    def save_as_csv(self, arg_df):
        """
        Save the compiled dataframe to csv file format
        :param arg_df:
        :return None:
        """
        arg_df.to_csv(os.path.join(CWD, STATIC_RESULT_FOLDER, "results_compiled.csv"), sep=",", index=False)

    def feather_to_df(self, arg_feather_filenames):
        """
        Converts all feather files in the results folder into dataframes and compile them
        :param arg_feather_filenames:
        :return compiled_df:
        """
        compiled_df = pd.DataFrame(columns=["time", "text", "user", "location", "platform"])
        for filename in arg_feather_filenames:
            df = pd.read_feather(filename)
            compiled_df = pd.concat([compiled_df, df], ignore_index=True)
        compiled_df.reset_index(inplace=True, drop=True)
        return compiled_df

    def get_user_tweets(self, arg_user):
        """
        Gets all tweets of a user
        :param arg_user:
        :return twitter_df:
        """
        all_feather_files = self.get_feather_files("*_tweets_results.feather")
        twitter_df = self.feather_to_df(all_feather_files)
        twitter_df = twitter_df.loc[twitter_df['user'] == arg_user]
        return twitter_df

    def twitter_user_list(self):
        """
        Gets all Twitter Users into a list
        :return twitter_user_list:
        """
        all_feather_files = self.get_feather_files("*_tweets_results.feather")
        twitter_df = self.feather_to_df(all_feather_files)
        twitter_df.drop_duplicates(subset=["user"], inplace=True)
        twitter_user_list = twitter_df["user"].tolist()
        return twitter_user_list

    def compile_reddit(self):
        """
        Compiles all reddit feather files into one
        :return reddit_df:
        """
        all_feather_files = self.get_feather_files("*_reddit_results.feather")
        reddit_df = self.feather_to_df(all_feather_files)
        for file in all_feather_files:
            if os.path.isfile(os.path.join(RESULT_FOLDER, file)):
                os.remove(os.path.join(RESULT_FOLDER, file))
        try:
            reddit_df.drop_duplicates(subset=["title", "user"], keep="first", inplace=True)
        except KeyError:
            pass
        return reddit_df

    def run(self):
        """
        Runs the feather reader module
        :return compiled_df:
        """
        feather_filenames = self.get_feather_files("*.feather")
        compiled_df = self.feather_to_df(feather_filenames)
        self.save_as_csv(compiled_df)
        return compiled_df
