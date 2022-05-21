import praw
import datetime
import pandas as pd
import os

CWD = os.getcwd()

class RedditScraper:
    def scrape(self,arg_search):
        reddit = praw.Reddit(client_id="",#my client id
                     client_secret="",  #your client secret
                     user_agent="", #user agent name
                     username = "",     # your reddit username
                     password = "")     # your reddit password

        #List of subreddits to scrape data
        sub_list = ['cybersecurity']  

        for i in sub_list:
            subreddit = reddit.subreddit(i)
            red_dict = {"title" : [],"author" : [],"created" : [],"text" : [],"url" : []}
                
            for post in subreddit.search(arg_search,sort = "new",limit = 100):
                date = datetime.datetime.fromtimestamp(post.created)
                red_dict["title"].append(post.title)
                red_dict["author"].append(post.author)
                red_dict["created"].append(date)
                red_dict["text"].append(post.selftext)
                red_dict["url"].append(post.url)

            post_data = pd.DataFrame(red_dict)
            post_data.to_csv(os.path.join(CWD, "results" ,i+"_"+ str(arg_search) +"_subreddit.csv"), sep=",", index=False)


