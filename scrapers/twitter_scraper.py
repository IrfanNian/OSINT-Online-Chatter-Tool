import snscrape.modules.twitter as sntwitter
import pandas as pd
import os

CWD = os.getcwd()


class TwitterScraper:
    def run(self, arg_searchbar, arg_advance_since=None, arg_advance_until=None, arg_advance_limit=None):
        default_tweets = 200  # temporary

        # Creating list to append tweet data to
        tweets_list = []

        # Checking for timeframe
        if arg_advance_since is not None and arg_advance_until is not None:
            statement = arg_searchbar + "since:" + arg_advance_since + " until:" + arg_advance_until
        elif arg_advance_since is None and arg_advance_until is not None:
            statement = arg_searchbar + "until:" + arg_advance_until
        elif arg_advance_since is not None and arg_advance_until is None:
            statement = arg_searchbar + "since:" + arg_advance_since
        else:
            statement = arg_searchbar

        # Check for tweet limit
        if type(arg_advance_limit) == int:
            default_tweets = arg_advance_limit

        # Using TwitterSearchScraper to scrape data and append tweets to list
        for i, tweet in enumerate(
                sntwitter.TwitterSearchScraper(statement).get_items()):
            if i > default_tweets:
                break
            tweets_list.append([tweet.date, tweet.id, tweet.content, tweet.user.username])

        # Creating a dataframe from the tweets list above
        tweets_df = pd.DataFrame(tweets_list, columns=["Datetime", "Tweet Id", "Text", "Username"])

        # Output to CSV for now
        tweets_df.to_csv(os.path.join(CWD, "results", "tweets-results.csv"), sep=",", index=False)
