# import praw
# import time
from psaw import PushshiftAPI
import datetime as dt
import pandas as pd
import os
import numpy as np

CWD = os.getcwd()
pd.options.mode.chained_assignment = None


class RedditScraper:
    def __init__(self, arg_search,  arg_advance_since=None, arg_advance_until=None, arg_advance_limit=None,
                 arg_advance_subreddit=None):
        self.arg_search = arg_search
        self.arg_advance_limit = arg_advance_limit
        self.arg_advance_since = arg_advance_since
        self.arg_advance_until = arg_advance_until
        self.arg_advance_subreddit = arg_advance_subreddit

    def clean_data(self, arg_df):
        """
        Remove unwanted data from the dataframe
        :param arg_df:
        :return df:
        """
        df = arg_df.loc[~(arg_df['text'] == '[removed]')]
        df['text'] = np.where(df['text'].isnull(), df['text'], df['title'])
        return df

    def run(self):
        """
        Runs the reddit scraper module
        :return None:
        """
        api = PushshiftAPI()

        # convert date to epoch timestamp
        if self.arg_advance_since:
            self.arg_advance_since = dt.datetime.strptime(self.arg_advance_since, '%Y-%m-%d')
            self.arg_advance_since = int(dt.datetime(self.arg_advance_since.year, self.arg_advance_since.month,
                                                     self.arg_advance_since.day).timestamp())
        if self.arg_advance_until:
            self.arg_advance_until = dt.datetime.strptime(self.arg_advance_until, '%Y-%m-%d')
            self.arg_advance_until = int(dt.datetime(self.arg_advance_until.year, self.arg_advance_until.month,
                                                     self.arg_advance_until.day).timestamp())

        # Check for customised limit
        if type(self.arg_advance_limit) == int:
            limit = self.arg_advance_limit
        else:
            limit = 500

        # List of subreddits to scrape data
        if self.arg_advance_subreddit is None:
            # default value
            sub_list = ['cybersecurity']
        else:
            # see how frontend people want to pass in the data
            sub_list = ['cybersecurity']  # todo

        for subreddit in sub_list:
            red_dict = {"title": [], "user": [], "time": [], "text": [], "url": []}

            # Checking for timeframe, after is since and before is until
            if self.arg_advance_since is not None and self.arg_advance_until is not None:
                gen = api.search_submissions(subreddit=subreddit, limit=limit, q=self.arg_search,
                                             after=self.arg_advance_since, before=self.arg_advance_until)
            elif self.arg_advance_since is None and self.arg_advance_until is not None:
                gen = api.search_submissions(subreddit=subreddit, limit=limit, q=self.arg_search,
                                             before=self.arg_advance_until)
            elif self.arg_advance_since is not None and self.arg_advance_until is None:
                gen = api.search_submissions(subreddit=subreddit, limit=limit, q=self.arg_search,
                                             after=self.arg_advance_since)
            else:
                gen = api.search_submissions(subreddit=subreddit, limit=limit, q=self.arg_search)

            for post in gen:
                try:
                    date = dt.datetime.fromtimestamp(post.created)
                    red_dict["title"].append(post.title)
                    red_dict["user"].append(post.author)
                    red_dict["time"].append(date)
                    red_dict["text"].append(post.selftext)
                    red_dict["url"].append(post.url)
                except AttributeError:
                    pass

            submission_df = pd.DataFrame(dict([(k, pd.Series(v, dtype=pd.StringDtype())) for k, v in red_dict.items()]))
            submission_df = self.clean_data(submission_df)
            submission_df.to_csv(os.path.join(CWD, "results", str(self.arg_search) + "_reddit_" + subreddit + ".csv"),
                                 sep=",", index=False)
            submission_df = submission_df.reset_index(drop=True)
            submission_df.to_feather(os.path.join(CWD, "results",
                                                  str(self.arg_search) + "_reddit_" + subreddit + ".feather"))

    # def run(self):
    #     """
    #     Runs the reddit scraper module
    #     :return None:
    #     """
    #     reddit = praw.Reddit(client_id="",  # my client id
    #                          client_secret="",  # your client secret
    #                          user_agent="",  # user agent name
    #                          username="",  # your reddit username
    #                          password="")  # your reddit password
    #
    #     # List of subreddits to scrape data
    #     sub_list = ['cybersecurity']
    #
    #     for i in sub_list:
    #         subreddit = reddit.subreddit(i)
    #         red_dict = {"title": [], "user": [], "time": [], "text": [], "url": []}
    #
    #         for post in subreddit.search(self.arg_search, sort="new", limit=100):
    #             date = datetime.datetime.fromtimestamp(post.created)
    #             red_dict["title"].append(post.title)
    #             red_dict["user"].append(post.author)
    #             red_dict["time"].append(date)
    #             red_dict["text"].append(post.selftext)
    #             red_dict["url"].append(post.url)
    #
    #         post_data = pd.DataFrame(red_dict)
    #         post_data.to_csv(os.path.join(CWD, "results", i + "_" + str(self.arg_search) + "_subreddit.csv"), sep=",",
    #                          index=False)
