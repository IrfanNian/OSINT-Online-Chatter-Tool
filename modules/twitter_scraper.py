import snscrape.modules.twitter as sntwitter
import pandas as pd
import os
import datetime as dt
from geopy.geocoders import Nominatim

CWD = os.getcwd()
geolocator = Nominatim(user_agent="chatter")


class TwitterScraper:
    def __init__(self, arg_search, arg_advance_since=None, arg_advance_until=None,
                 arg_advance_limit=None, arg_refinement=None):
        self.arg_search = arg_search
        self.arg_advance_since = arg_advance_since
        self.arg_advance_until = arg_advance_until
        self.arg_advance_limit = arg_advance_limit
        self.arg_refinement = arg_refinement

    def run(self):
        """
        Runs the twitter scraper module
        :return None:
        """
        tweets_list = []

        if self.arg_advance_since is not None and self.arg_advance_until is not None:
            statement = self.arg_search + " since:" + self.arg_advance_since + " until:" + self.arg_advance_until
        elif self.arg_advance_since is None and self.arg_advance_until is not None:
            statement = self.arg_search + " until:" + self.arg_advance_until
        elif self.arg_advance_since is not None and self.arg_advance_until is None:
            statement = self.arg_search + " since:" + self.arg_advance_since
        else:
            statement = self.arg_search

        for i, tweet in enumerate(sntwitter.TwitterSearchScraper(statement).get_items()):
            if i > self.arg_advance_limit:
                break
            if self.arg_search.lower() not in tweet.content.lower():
                continue
            date = str(tweet.date).split("+", 1)[0]
            date = dt.datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
            date = date.isoformat()
            location = tweet.coordinates
            if location is not None:
                location = str(geolocator.reverse("%s, %s" % (location.latitude, location.longitude)))
                location = location.split(",")[-1][1:]
            else:
                location = "No Data"
            tweets_list.append([date, tweet.id, tweet.content, tweet.user.username, location, "twitter"])

        tweets_df = pd.DataFrame(tweets_list, columns=["time", "tweet id", "text", "user", "location", "platform"])

        if self.arg_refinement is not None:
            tweets_df = tweets_df[tweets_df["text"].str.contains(self.arg_refinement)]

        if len(tweets_df) != 0:
            tweets_df = tweets_df.reset_index(drop=True)
            tweets_df.to_feather(os.path.join(CWD, "results", str(self.arg_search) + "_tweets_results_" + str(dt.datetime.today().date()) + ".feather"))
