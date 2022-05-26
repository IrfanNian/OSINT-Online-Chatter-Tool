import requests
import json
import pandas as pd
import threading
import os
# GET /api/v3/search/psbdmp
# curl https://psbdmp.ws/api/v3/search/hacking


# response = requests.get("https://psbdmp.ws/api/v3/search/hacking")
# print(response.status_code)  # response status code
# print(response.json())

CWD = os.getcwd()


class PastebinScrapper(threading.Thread):
    def __init__(self, arg_search):
        threading.Thread.__init__(self)
        self.arg_search = arg_search

    def jprint(self, obj):
        # create a formatted string of the Python JSON object
        text = json.dumps(obj, sort_keys=True, indent=4)
        print(text)

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
        df.to_csv(os.path.join(CWD, "results", str(self.arg_search) + "_pastebin_results.csv"), sep=",", index=False)
