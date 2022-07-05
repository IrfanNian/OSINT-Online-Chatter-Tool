from psaw import PushshiftAPI
import datetime as dt
import pandas as pd
import os
import numpy as np

CWD = os.getcwd()
pd.options.mode.chained_assignment = None


class RedditScraper:
    def __init__(self, arg_search, arg_advance_subreddit=None, arg_advance_since=None, arg_advance_until=None,
                 arg_advance_limit=None, arg_refinement=None):
        self.arg_search = arg_search
        self.arg_advance_limit = arg_advance_limit
        self.arg_advance_since = arg_advance_since
        self.arg_advance_until = arg_advance_until
        self.arg_advance_subreddit = arg_advance_subreddit
        self.arg_refinement = arg_refinement

    def clean_data(self, arg_df):
        """
        Remove unwanted data from the dataframe
        :param arg_df:
        :return df:
        """
        df = arg_df.loc[~(arg_df['text'] == '[removed]')]
        df['text'] = np.where(df['text'].isnull(), df['text'], df['title'])
        df = df.drop_duplicates(subset=['title', 'user'], keep='first')
        return df

    def run(self):
        """
        Runs the reddit scraper module
        :return None:
        """
        api = PushshiftAPI()

        if self.arg_advance_since:
            self.arg_advance_since = dt.datetime.strptime(self.arg_advance_since, '%Y-%m-%d')
            self.arg_advance_since = int(dt.datetime(self.arg_advance_since.year, self.arg_advance_since.month,
                                                     self.arg_advance_since.day).timestamp())
        if self.arg_advance_until:
            self.arg_advance_until = dt.datetime.strptime(self.arg_advance_until, '%Y-%m-%d')
            self.arg_advance_until = int(dt.datetime(self.arg_advance_until.year, self.arg_advance_until.month,
                                                     self.arg_advance_until.day).timestamp())

        if self.arg_advance_subreddit is None:
            sub_list = ['cybersecurity', 'blueteamsec', 'netsec']
        else:
            sub_list = self.arg_advance_subreddit

        for subreddit in sub_list:
            red_dict = {"title": [], "user": [], "time": [], "text": [], "url": [], "location": [], "platform": []}
            if self.arg_advance_since is not None and self.arg_advance_until is not None:
                gen = api.search_submissions(subreddit=subreddit, limit=self.arg_advance_limit, q=self.arg_search,
                                             after=self.arg_advance_since, before=self.arg_advance_until)
            elif self.arg_advance_since is None and self.arg_advance_until is not None:
                gen = api.search_submissions(subreddit=subreddit, limit=self.arg_advance_limit, q=self.arg_search,
                                             before=self.arg_advance_until)
            elif self.arg_advance_since is not None and self.arg_advance_until is None:
                gen = api.search_submissions(subreddit=subreddit, limit=self.arg_advance_limit, q=self.arg_search,
                                             after=self.arg_advance_since)
            else:
                gen = api.search_submissions(subreddit=subreddit, limit=self.arg_advance_limit, q=self.arg_search)

            for post in gen:
                try:
                    date = dt.datetime.fromtimestamp(post.created).isoformat()
                    red_dict["title"].append(post.title)
                    red_dict["user"].append(post.author)
                    red_dict["time"].append(date)
                    red_dict["text"].append(post.selftext)
                    red_dict["url"].append(post.url)
                    red_dict["location"].append("No Data")
                    red_dict["platform"].append("reddit")
                except AttributeError:
                    pass

            submission_df = pd.DataFrame(dict([(k, pd.Series(v, dtype=pd.StringDtype())) for k, v in red_dict.items()]))
            submission_df = self.clean_data(submission_df)
            if self.arg_refinement is not None:
                submission_df = submission_df[submission_df["text"].str.contains(self.arg_refinement)]
            if len(submission_df) != 0:
                submission_df = submission_df.reset_index(drop=True)
                submission_df.to_feather(os.path.join(CWD, "results",
                                                      str(self.arg_search) + "_reddit_" + subreddit + "_" + str(dt.datetime.today().date()) + ".feather"))
