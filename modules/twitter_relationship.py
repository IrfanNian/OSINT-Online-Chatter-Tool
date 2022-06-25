import os
import json
import configparser
import tweepy
from modules.feather_reader import FeatherReader
import pandas as pd

pd.set_option("display.max_rows", None, "display.max_columns", None)
CWD = os.getcwd()
UPLOAD_FOLDER = os.path.join("static", "uploads")
RESULT_FOLDER = "results"
STATIC_RESULT_FOLDER = os.path.join("static", "results")


class TwitterFriends:
    def __init__(self, arg_config):
        self.client = None
        self.authenticate(arg_config)
        self.user_pending_queue = []
        self.user_completed_queue = []
        self.master_list = []
        self.user_list = []

    def authenticate(self, arg_config):
        """
        Authenticates using Twitter API OAuth 2.0 Bearer Token
        :param arg_config:
        :return None:
        """
        configs = configparser.RawConfigParser()
        configs.read(os.path.join(UPLOAD_FOLDER, arg_config))
        keys = configs['TWITTER']
        bearer_token = keys['BEARER_TOKEN']
        self.client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)

    def get_user_id(self, arg_screen_name):
        """
        Converts screen name to user ID
        :param arg_screen_name:
        :return screen_name_id.data.id:
        """
        screen_name_id = self.client.get_user(username=arg_screen_name)
        return screen_name_id.data.id

    def twitter_user_list(self):
        """
        Gets all the Twitter user into a list from the feather files
        :return twitter_user_list:
        """
        fr = FeatherReader()
        twitter_user_list = fr.twitter_user_list()
        return twitter_user_list

    def scrape_friends(self, arg_user_id):
        """
        Requests for friends from the ID
        :param arg_user_id:
        :return friend_username:
        """
        friend_username = []
        for response in tweepy.Paginator(self.client.get_users_following, arg_user_id, max_results=1000):
            print(response)
            for friend in response.data:
                friend_username.append(friend.username)
        return friend_username

    def run(self, arg_user, arg_level):
        """
        Runs the module
        :param arg_user:
        :param arg_level:
        :return None:
        """
        link_df = pd.DataFrame(columns=['source', 'target', 'value'])
        searched_user = arg_user
        self.master_list = self.twitter_user_list()
        self.user_pending_queue.append(arg_user)
        self.user_list.append(arg_user)
        level = 0
        while level < arg_level:
            user_level_list = []
            while len(self.user_pending_queue) != 0:
                if self.user_pending_queue[0] not in self.user_completed_queue:
                    print(self.user_pending_queue)
                    user_id = self.get_user_id(self.user_pending_queue[0])
                    try:
                        friend_list = self.scrape_friends(user_id)
                        for friend in friend_list:
                            if friend in self.master_list:
                                user_level_list.append(friend)
                                self.user_list.append(friend)
                                if searched_user in friend_list:
                                    value = 5
                                else:
                                    value = 1
                                link_df.loc[len(link_df)] = [self.user_pending_queue[0], friend, value]
                    except:
                        print(f"An error occurred, skipping {self.user_pending_queue[0]}")
                    self.user_completed_queue.append(self.user_pending_queue[0])
                    self.user_pending_queue.pop(0)
                else:
                    self.user_pending_queue.pop(0)
            level += 1
            self.user_pending_queue = self.user_pending_queue + user_level_list

        nodes_df = pd.DataFrame({'user': self.user_list})
        nodes_df['group'] = nodes_df.index + 1
        link_dict = link_df.to_dict("records")
        nodes_dict = nodes_df.to_dict("records")
        json_prep = {"links": link_dict, "nodes": nodes_dict}
        json_dump = json.dumps(json_prep, indent=4, sort_keys=True)
        filename_out = os.path.join(STATIC_RESULT_FOLDER, "twitter_friendship.json")
        json_out = open(filename_out, 'w')
        json_out.write(json_dump)
        json_out.close()
