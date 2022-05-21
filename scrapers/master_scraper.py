from scrapers.twitter_scraper import TwitterScraper
from scrapers.reddit_scraper import RedditScraper


class MasterScraper:
    def run(self, arg_scraping_sources, arg_searchbar_text):
        # start them scraper threads
        if arg_scraping_sources["ts"]:
            ts_thread = TwitterScraper(arg_searchbar_text)
            ts_thread.start()
        if arg_scraping_sources["rs"]:
            rs_thread = RedditScraper(arg_searchbar_text)
            rs_thread.start()

        # join them scraper threads
        if arg_scraping_sources["ts"]:
            ts_thread.join()
        if arg_scraping_sources["rs"]:
            rs_thread.join()
