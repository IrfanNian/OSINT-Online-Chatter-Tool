import requests
from requests.structures import CaseInsensitiveDict
import json
import pandas as pd
import os
import datetime as dt

CWD = os.getcwd()


class PastebinScrapper:
    def __init__(self, arg_search, arg_advance_since=None, arg_advance_until=None, arg_limit=None, arg_refinement=None):
        self.arg_search = arg_search
        self.arg_advance_since = arg_advance_since
        self.arg_advance_until = arg_advance_until
        self.arg_limit = arg_limit
        self.arg_refinement = arg_refinement

    def day_calculator(self):
        """
        Gets the difference in days between two dates
        :return abs((d2 - d1).days):
        """
        d1 = dt.datetime.strptime(self.arg_advance_since, "%Y-%m-%d")
        d2 = dt.datetime.strptime(self.arg_advance_until, "%Y-%m-%d")
        return abs((d2 - d1).days)

    def run(self):
        """
        Runs the pastebin scraper module
        :return None:
        """
        pb_df = pd.DataFrame(columns=["time", "id", "text", "user", "location", "platform"])
        days = self.day_calculator()
        headers = CaseInsensitiveDict()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        post_date = dt.datetime.strptime(self.arg_advance_since, "%Y-%m-%d").date()
        count = 0
        while days > -1:
            post_date_str = post_date.strftime("%d.%m.%Y")
            date_range = "from=" + post_date_str + "&to=" + post_date_str
            resp = requests.post("https://psbdmp.ws/api/v3/getbydate", headers=headers, data=date_range)
            json_data = json.loads(resp.text)
            count += len(json_data[0])
            for result in json_data[0]:
                response = requests.get(f"https://pastebin.com/raw/{result['id']}").text
                if self.arg_search in response:
                    pb_df.loc[len(pb_df)] = [post_date, result['id'], response, result['id'], "No Data", "pastebin"]
                    pb_df['time'] = pd.to_datetime(pb_df['time'], format='%Y-%m-%d %H:%M:%S')
                    pb_df['time'] = pb_df['time'].apply(lambda x: x.isoformat())
                    pb_df['text'] = pb_df['text'].str[:32567]
            if count > self.arg_limit:
                break
            post_date = post_date + dt.timedelta(days=1)
            days -= 1

        if self.arg_refinement is not None:
            pb_df = pb_df[pb_df["text"].str.contains(self.arg_refinement)]
        if len(pb_df) != 0:
            pb_df.to_csv(os.path.join(CWD, "results", str(self.arg_search) + "_pastebin_results.csv"), sep=",", index=False)
            pb_df = pb_df.reset_index(drop=True)
            pb_df.to_feather(os.path.join(CWD, "results", str(self.arg_search) + "_pastebin_results_" + str(dt.datetime.today().date()) + ".feather"))
