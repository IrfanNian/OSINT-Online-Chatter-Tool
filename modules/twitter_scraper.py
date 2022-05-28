import snscrape.modules.twitter as sntwitter
import pandas as pd
import os
import threading

CWD = os.getcwd()


class TwitterScraper(threading.Thread):
    def __init__(self, arg_search, arg_advance_since=None, arg_advance_until=None, arg_advance_limit=None,
                 arg_advance_include=None, arg_advance_exclude=None):
        threading.Thread.__init__(self)
        self.arg_search = arg_search
        self.arg_advance_since = arg_advance_since
        self.arg_advance_until = arg_advance_until
        self.arg_advance_limit = arg_advance_limit
        self.arg_advance_include = arg_advance_include
        self.arg_advance_exclude = arg_advance_exclude

    def run(self):
        """
        Runs the twitter scraper module
        :return None:
        """
        limit = 500  # todo: still have to decide default value

        # Creating list to append tweet data to
        tweets_list = []

        # Checking for timeframe
        if self.arg_advance_since is not None and self.arg_advance_until is not None:
            statement = self.arg_search + " since:" + self.arg_advance_since + " until:" + self.arg_advance_until
        elif self.arg_advance_since is None and self.arg_advance_until is not None:
            statement = self.arg_search + " until:" + self.arg_advance_until
        elif self.arg_advance_since is not None and self.arg_advance_until is None:
            statement = self.arg_search + " since:" + self.arg_advance_since
        else:
            statement = self.arg_search

        # Check for customised tweet limit
        if type(self.arg_advance_limit) == int:
            limit = self.arg_advance_limit

        # Using TwitterSearchScraper to scrape data and append tweets to list
        for i, tweet in enumerate(sntwitter.TwitterSearchScraper(statement).get_items()):
            if i > limit:
                break
            if self.arg_search.lower() not in tweet.content.lower():
                continue
            tweets_list.append([tweet.date, tweet.id, tweet.content, tweet.user.username])

        # Creating a dataframe from the tweets list above
        tweets_df = pd.DataFrame(tweets_list, columns=["time", "tweet id", "text", "user"])

        # Advance search operations for must be "included/excluded"
        # todo: the plan is to search the dataframe again

        # Output to CSV
        tweets_df.to_csv(os.path.join(CWD, "results", str(self.arg_search) + "_tweets_results.csv"), sep=",",
                         index=False)

        # Output to feather
        tweets_df = tweets_df.reset_index()
        tweets_df.to_feather(os.path.join(CWD, "results", str(self.arg_search) + "_tweets_results.feather"))
