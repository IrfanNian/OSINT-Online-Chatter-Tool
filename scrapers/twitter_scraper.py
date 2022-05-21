import snscrape.modules.twitter as sntwitter
import pandas as pd
import os


CWD = os.getcwd()


class TwitterScraper:
    def run(self, arg_search):
        # Creating list to append tweet data to
        tweets_list = []

        # Using TwitterSearchScraper to scrape data and append tweets to list
        for i, tweet in enumerate(
                sntwitter.TwitterSearchScraper(arg_search).get_items()):
            if i > 200:
                break
            tweets_list.append([tweet.date, tweet.id, tweet.content, tweet.user.username])

        # Creating a dataframe from the tweets list above
        tweets_df = pd.DataFrame(tweets_list, columns=["Datetime", "Tweet Id", "Text", "Username"])

        # Output to CSV for now
        tweets_df.to_csv(os.path.join(CWD, "results", "tweets-results.csv"), sep=",", index=False)
