import os
import json
import configparser
import tweepy
from modules.feather_reader import FeatherReader
import pandas as pd
from colour import Color

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
        if os.path.isfile(os.path.join(UPLOAD_FOLDER, arg_config)):
            os.remove(os.path.join(UPLOAD_FOLDER, arg_config))

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
        link_df = pd.DataFrame(columns=['source', 'target', 'value', 'color'])
        color_user = []
        red = Color("red")
        blue = Color("blue")
        color_range = list(red.range_to(blue, 7))
        self.master_list = self.twitter_user_list()
        self.user_pending_queue.append(arg_user)
        self.user_list.append(arg_user)
        color_user.append(color_range[0].hex_l)
        level = 0
        while level < arg_level and len(self.user_completed_queue) < len(self.master_list):
            user_level_list = []
            while len(self.user_pending_queue) != 0:
                if self.user_pending_queue[0] not in self.user_completed_queue:
                    user_id = self.get_user_id(self.user_pending_queue[0])
                    try:
                        friend_list = self.scrape_friends(user_id)
                        for friend in friend_list:
                            if friend in self.master_list:
                                user_level_list.append(friend)
                                self.user_list.append(friend)
                                color_user.append(color_range[level % len(color_range)].hex_l)
                                follow_back = link_df[['source', 'target']][
                                    link_df['source'].str.contains(friend, na=False) & (
                                                link_df['target'] == self.user_pending_queue[0])]
                                if follow_back.empty:
                                    value = 1
                                else:
                                    value = 3
                                link_df.loc[len(link_df)] = [self.user_pending_queue[0], friend, value,
                                                             color_range[level % len(color_range)].hex_l]
                    except:
                        print(f"An error occurred, skipping {self.user_pending_queue[0]}")
                    self.user_completed_queue.append(self.user_pending_queue[0])
                    self.user_pending_queue.pop(0)
                else:
                    self.user_pending_queue.pop(0)
            level += 1
            user_level_list = list(set(user_level_list))
            self.user_pending_queue = self.user_pending_queue + user_level_list

        nodes_df = pd.DataFrame({'user': self.user_list, 'color': color_user})
        nodes_df.drop_duplicates(subset=['user'], inplace=True)
        nodes_df['group'] = nodes_df.index + 1
        total_users = len(nodes_df)
        part1 = link_df.iloc[:, 0:1]
        part2 = link_df.iloc[:, 1:2]
        new_col = ["user"]
        part1.columns = new_col
        part2.columns = new_col
        count_df = pd.concat([part1, part2], ignore_index=True)
        count_df = count_df.value_counts().reset_index(name="counts")
        count_df.sort_values(by="user", inplace=True, key=lambda col: col.str.lower(), ascending=True)
        count_df.sort_values(by="counts", inplace=True, ascending=False)
        following_df = part1.value_counts().reset_index(name="counts")
        following_df = pd.merge(following_df, nodes_df, on=["user"], how="outer")
        following_df = following_df.loc[:, ['user', 'counts']]
        following_df["counts"] = following_df["counts"].fillna(0)
        following_df.sort_values(by="user", inplace=True, key=lambda col: col.str.lower(), ascending=True)
        following_df.sort_values(by="counts", inplace=True, ascending=False)
        following_df_dict_top = following_df.head(5).to_dict("records")
        following_df_dict_tail = following_df.tail(5).to_dict("records")
        follower_df = part2.value_counts().reset_index(name="counts")
        follower_df = pd.merge(follower_df, nodes_df, on=["user"], how="outer")
        follower_df = follower_df.loc[:, ['user', 'counts']]
        follower_df["counts"] = follower_df["counts"].fillna(0)
        follower_df.sort_values(by="user", inplace=True, key=lambda col: col.str.lower(), ascending=True)
        follower_df.sort_values(by="counts", inplace=True, ascending=False)
        follower_df_dict_top = follower_df.head(5).to_dict("records")
        follower_df_dict_tail = follower_df.tail(5).to_dict("records")
        top_five_dict = count_df.head(5).to_dict("records")
        bottom_five_dict = count_df.tail(5).to_dict("records")
        link_dict = link_df.to_dict("records")
        nodes_dict = nodes_df.to_dict("records")
        json_prep = {"level": arg_level, "users": total_users, "top_five": top_five_dict,
                     "bottom_five": bottom_five_dict, "links": link_dict, "nodes": nodes_dict,
                     "searched_user": arg_user, "most_following": following_df_dict_top,
                     "least_following": following_df_dict_tail, "most_follower": follower_df_dict_top,
                     "least_follower": follower_df_dict_tail}
        json_dump = json.dumps(json_prep, indent=4, sort_keys=False)
        filename_out = os.path.join(STATIC_RESULT_FOLDER, "twitter_friendship.json")
        json_out = open(filename_out, 'w')
        json_out.write(json_dump)
        json_out.close()
