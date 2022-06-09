import requests
import json
import pandas as pd
import os
import datetime as dt
# GET /api/v3/search/psbdmp
# curl https://psbdmp.ws/api/v3/search/hacking


# response = requests.get("https://psbdmp.ws/api/v3/search/hacking")
# print(response.status_code)  # response status code
# print(response.json())

CWD = os.getcwd()


class PastebinScrapper:
    def __init__(self, arg_search, arg_advance_subreddit=None, arg_advance_since=None, arg_advance_until=None):
        self.arg_search = arg_search
        self.arg_advance_subreddit = arg_advance_subreddit
        self.arg_advance_since = arg_advance_since
        self.arg_advance_until = arg_advance_until

    def jprint(self, obj):
        # create a formatted string of the Python JSON object
        text = json.dumps(obj, sort_keys=True, indent=4)
        print(text)

    def date_range(self, arg_df):
        """
        Method to support time range advance feature
        :param arg_df:
        :return df:
        """
        self.arg_advance_since = dt.datetime.strptime(self.arg_advance_since, '%Y-%m-%d')
        self.arg_advance_until = dt.datetime.strptime(self.arg_advance_until, '%Y-%m-%d')
        arg_df['time'] = pd.to_datetime(arg_df['time'])
        mask = (arg_df.time >= self.arg_advance_since) & (arg_df.time <= self.arg_advance_until)
        df = arg_df.loc[mask]
        return df

    def run(self):
        """
        Runs the pastebin scraper module
        :return None:
        """
        # API Request
        response = requests.get("https://psbdmp.ws/api/v3/search/" + self.arg_search)
        # print("Response Status: " + str(response.status_code))
        json_data = json.loads(response.text)
        # print(json_data)

        # Convert to csv format
        df = pd.json_normalize(json_data['data'])
        if self.arg_advance_since is not None or self.arg_advance_until is not None:
            df = self.date_range(df)
        df['time'] = pd.to_datetime(df['time'], format='%Y-%m-%d %H:%M:%S')
        df['time'] = df['time'].apply(lambda x: x.isoformat())
        if len(df) != 0:
            df.to_csv(os.path.join(CWD, "results", str(self.arg_search) + "_pastebin_results.csv"), sep=",", index=False)
            df = df.reset_index(drop=True)
            df.to_feather(os.path.join(CWD, "results", str(self.arg_search) + "_pastebin_results.feather"))
