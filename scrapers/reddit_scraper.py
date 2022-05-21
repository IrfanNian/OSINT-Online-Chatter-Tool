import praw
import datetime
import pandas as pd
import os

reddit = praw.Reddit(client_id="",#my client id
                     client_secret="",  #your client secret
                     user_agent="", #user agent name
                     username = "",     # your reddit username
                     password = "")     # your reddit password

CWD = os.getcwd()

#List of subreddits to scrape data
sub_list = ['cybersecurity','computerscience']  

for i in sub_list:
    subreddit = reddit.subreddit(i)
    #Keywords to search within subreddit
    keyword = ['vulnerability','malware']

    for j in keyword:
        red_dict = {"title" : [],"author" : [],"created" : [],"text" : [],"url" : []}
        
        for post in subreddit.search(keyword,sort = "new",limit = 10):
            date = datetime.datetime.fromtimestamp(post.created)
            red_dict["title"].append(post.title)
            red_dict["author"].append(post.author)
            red_dict["created"].append(date)
            red_dict["text"].append(post.selftext)
            red_dict["url"].append(post.url)

        post_data = pd.DataFrame(red_dict)
        post_data.to_csv(os.path.join(CWD,i+"_"+ j +"subreddit.csv"), sep=",", index=False)
