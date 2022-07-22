# Online Chatter

## About the Project
This project is a full stack application that aims to track and perform analysis on Social Networking Services (SNS) based on a related keyword. The tool will perform scraping on SNS and the results will be displayed on a dashboard where user can gain insights from. The current build supports scraping for Twitter, Reddit and Pastebin.

## Package Installation
```bash
pip install -r requirements.txt
```
## How to Run

### Using Command line
1) At the main directory of the repository

```bash
python app.py
```
2) Open a web browser to this address: 

> http://127.0.0.1:5000 

### OR Using IDE
1) Run app.py

2) Open a web browser to this address: 

> http://127.0.0.1:5000 


## Usage:
NOTE: To reuse past results based on feather files, refer to Part 2.

### Part 1:
1) Enter a keyword in the search bar (eg: Ransomware)

2) Fill in the advanced options as follows:
<img src="https://imgur.com/xhR8hYK.png"> Choose platforms to scrape from: Twitter, Reddit, Pastebin. (Default setting will scrape from all 3 platforms)  
      

3) Subreddit (optional)
<img src="https://imgur.com/5QBN5hV.png"> If reddit platform is selected, user can specify multiple subreddit to perform scraping on. Commas are used as delimiters. Eg: hacking,sysadmin  

  
4) Time range selection
<img src="https://imgur.com/u8UqIMt.png"> Choose a time range which data will be scraped from.(Default setting is 7 days)
  
5) Depth
<img src="https://imgur.com/JuJdAR1.png"> Choose the maximum amount of data to scrape based on the given preset values quick, standard, and deep. Respectively, the iterations are 10,000, 50,000 and 100,000. User can also select custom option for custom input. (The default value if the user did not specify any would be 10,000)
  
6) Refinement

    <img src="https://imgur.com/CnJNRtZ.png"> 
        
    User can choose to input additonal keyword for refinement. This feature in essence works the same way the Google exact-match search operator (“”) does, which basically tells the tool to only return search results if it only has the keyword provided.  
      
        
  
7) The user will then click search


### Part 2:
This section is for reusing past scraped results. User will upload feather files to view data on dashboard without performing scraping operations again.

1) Upload past results
<img src="https://imgur.com/3NhRYTz.png">
User can upload feather file(s)

2) Disable scraper
<img src="https://imgur.com/lef3mvJ.png">
After upload the file(s), the user must check the disable scraper option.

3) The user will then click search

## Dashboard after scraping
Dashboard Results:
<img src="https://imgur.com/F5BKou6.png">

<img src="https://imgur.com/wApJBKH.png">


## Twitter Relationship Usage
(NOTE: This feature requires a Twitter Developer Account. Just like previous usage, for uploading an existing JSON file, please refer to Part 2.)

User can choose to view a relationship model for twitter users based on data scraped from twitter.

### Part 1:

1) Select user
<img src="https://imgur.com/pY1yi9G.png">
Step 1: Navigate to the Twitter Relationship Visualizer page, it can be accessed from the scraping results page. A list of users from the results will be listed on the webpage for easy access and browsing. Select one user from the result list and input it into the search field. The user this example would be using would be “ka0com”. 

2) Upload credentials
<img src="https://imgur.com/cuLwkHR.png">
Step 2: The end user must have a Twitter Developer Account and registered an application to obtain a bearer token which is needed to authenticate with the official Twitter API. After obtaining the token, it needs to be in a “.ini” file in the format as seen in image above. The user would then be able to upload the credential file onto the website to authenticate with the Twitter API. 

3) Advanced Options
<img src="https://imgur.com/SYEfloE.png">
Step 3: The user needs to specify the level/depth desired. The depth that the example will be using would be “3”, it is also the default if none is specified. If a high level is chosen, the tool will take a long time to gather all the data required. The user is now able to click on the search button to execute the scraping process. 


### Part 2:
This section is for uploading of past results.

1) Upload 
<img src="https://imgur.com/sDLYyRg.png">
The user can upload an existing JSON result file to display the graph.

2) Submit
The user will submit the JSON file.


Result for Twitter Relationship:
<img src="https://imgur.com/SdF3dsQ.png">