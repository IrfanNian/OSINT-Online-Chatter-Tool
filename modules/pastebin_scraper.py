import time
import requests
from requests.structures import CaseInsensitiveDict
import json
import pandas as pd
import os
import datetime as dt
import multiprocessing

CWD = os.getcwd()
POISON_PILL = "STOP"


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

    def process_id(self, arg_id_queue, arg_date_queue, arg_list):
        """
        Processes ID from psbdmp API
        :param arg_id_queue:
        :param arg_date_queue:
        :param arg_list:
        :return None:
        """
        while True:
            new_id = arg_id_queue.get()
            new_date = arg_date_queue.get()
            if new_id == POISON_PILL:
                break
            response = requests.get(f"https://pastebin.com/raw/{new_id}").text
            time.sleep(1)
            if self.arg_search in response:
                arg_list.append([new_date, new_id, response, new_id, "No Data", "pastebin"])
        return

    def run(self):
        """
        Runs the pastebin scraper module
        :return None:
        """
        manager = multiprocessing.Manager()
        id_queue = manager.Queue()
        date_queue = manager.Queue()
        shared_list = manager.list()
        pool = multiprocessing.Pool(4)
        for i in range(4):
            id_result = pool.starmap_async(self.process_id, [[id_queue, date_queue, shared_list]], chunksize=10)
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
            for result in json_data[0]:
                count += 1
                id_queue.put(result['id'])
                date_queue.put(post_date)
                if count >= self.arg_limit:
                    break
            post_date = post_date + dt.timedelta(days=1)
            days -= 1
            if count >= self.arg_limit:
                break
        for i in range(4):
            id_queue.put(POISON_PILL)
            date_queue.put(POISON_PILL)
        pool.close()
        pool.join()
        shared_list = list(shared_list)
        pb_df = pd.DataFrame(shared_list, columns=["time", "id", "text", "user", "location", "platform"])
        pb_df['time'] = pd.to_datetime(pb_df['time'], format='%Y-%m-%d %H:%M:%S')
        pb_df['time'] = pb_df['time'].apply(lambda x: x.isoformat())
        pb_df.sort_values(by=['time'], inplace=True)
        if self.arg_refinement is not None:
            pb_df = pb_df[pb_df["text"].str.contains(self.arg_refinement)]
        if len(pb_df) != 0:
            pb_df = pb_df.reset_index(drop=True)
            pb_df.to_feather(os.path.join(CWD, "results", str(self.arg_search) + "_" + str(dt.datetime.today().date()) +
                                          "_pastebin_results.feather"))
