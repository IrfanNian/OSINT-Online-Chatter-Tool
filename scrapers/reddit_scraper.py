import praw
import datetime
import pandas as pd
import os
import threading

CWD = os.getcwd()


class RedditScraper(threading.Thread):
    def __init__(self, arg_search):
        threading.Thread.__init__(self)
        self.arg_search = arg_search

    def run(self):
        """
        Runs the reddit scraper module
        :return None:
        """
        reddit = praw.Reddit(client_id="",  # my client id
                             client_secret="",  # your client secret
                             user_agent="",  # user agent name
                             username="",  # your reddit username
                             password="")  # your reddit password

        # List of subreddits to scrape data
        sub_list = ['cybersecurity']

        for i in sub_list:
            subreddit = reddit.subreddit(i)
            red_dict = {"title": [], "user": [], "time": [], "text": [], "url": []}

            for post in subreddit.search(self.arg_search, sort="new", limit=100):
                date = datetime.datetime.fromtimestamp(post.created)
                red_dict["title"].append(post.title)
                red_dict["user"].append(post.author)
                red_dict["time"].append(date)
                red_dict["text"].append(post.selftext)
                red_dict["url"].append(post.url)

            post_data = pd.DataFrame(red_dict)
            post_data.to_csv(os.path.join(CWD, "results", i + "_" + str(self.arg_search) + "_subreddit.csv"), sep=",",
                             index=False)
