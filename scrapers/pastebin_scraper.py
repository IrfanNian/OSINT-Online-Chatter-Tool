import requests
import json
import pandas as pd
# GET /api/v3/search/psbdmp
# curl https://psbdmp.ws/api/v3/search/hacking


# response = requests.get("https://psbdmp.ws/api/v3/search/hacking")
# print(response.status_code)  # response status code
# print(response.json())

# User input a keyword
keyword = str(input("Enter keyword: "))
# API Request
response = requests.get("https://psbdmp.ws/api/v3/search/"+ keyword)
print("Response Status: " + str(response.status_code))
# print(response.json()) #raw data from API

def jprint(obj):
    # create a formatted string of the Python JSON object
    text = json.dumps(obj, sort_keys=True, indent=4)
    print(text)

# Print in json format
# jprint(response.json())

# writeFile =open('PasteBin.json', 'w')
# writeFile.write(response.json())
# writeFile.close()

json_data = json.loads(response.text)
print(json_data)

# Convert to csv format
df = pd.json_normalize(json_data['data'])
df.to_csv("PasteBin.csv")