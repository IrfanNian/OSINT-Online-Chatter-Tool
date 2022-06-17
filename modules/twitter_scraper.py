import snscrape.modules.twitter as sntwitter
import pandas as pd
import os
import datetime as dt
from geopy.geocoders import Nominatim

CWD = os.getcwd()
geolocator = Nominatim(user_agent="chatter")


class TwitterScraper:
    def __init__(self, arg_search, arg_advance_subreddit=None, arg_advance_since=None, arg_advance_until=None,
                 arg_advance_limit=None, arg_refinement=None):
        self.arg_search = arg_search
        self.arg_advance_since = arg_advance_since
        self.arg_advance_subreddit = arg_advance_subreddit
        self.arg_advance_until = arg_advance_until
        self.arg_advance_limit = arg_advance_limit
        self.arg_refinement = arg_refinement

    def run(self):
        """
        Runs the twitter scraper module
        :return None:
        """
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
        else:
            limit = 500

        # Using TwitterSearchScraper to scrape data and append tweets to list
        for i, tweet in enumerate(sntwitter.TwitterSearchScraper(statement).get_items()):
            if i > limit:
                break
            if self.arg_search.lower() not in tweet.content.lower():
                continue
            date = str(tweet.date).split("+", 1)[0]
            date = dt.datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
            date = date.isoformat()
            location = tweet.coordinates
            if location is not None:
                location = geolocator.reverse("%s, %s" % (location.latitude, location.longitude))
            tweets_list.append([date, tweet.id, tweet.content, tweet.user.username, str(location)])

        # Creating a dataframe from the tweets list above
        tweets_df = pd.DataFrame(tweets_list, columns=["time", "tweet id", "text", "user", "location"])

        # Refinement
        if self.arg_refinement is not None:
            tweets_df = tweets_df[tweets_df["text"].str.contains(self.arg_refinement)]

        # Output to CSV
        if len(tweets_df) != 0:
            tweets_df.to_csv(os.path.join(CWD, "results", str(self.arg_search) + "_tweets_results.csv"), sep=",",
                             index=False)

            # Output to feather
            tweets_df = tweets_df.reset_index(drop=True)
            tweets_df.to_feather(os.path.join(CWD, "results", str(self.arg_search) + "_tweets_results.feather"))
