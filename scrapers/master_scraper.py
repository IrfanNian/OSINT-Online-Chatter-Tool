from scrapers.twitter_scraper import TwitterScraper
from scrapers.reddit_scraper import RedditScraper
from scrapers.pastebin_scraper import PastebinScrapper


class MasterScraper:
    def run(self, arg_scraping_sources, arg_searchbar_text):
        """
        Runs the master scraper which controls the other scraper modules
        :param arg_scraping_sources:
        :param arg_searchbar_text:
        :return None:
        """
        # start them scraper threads
        if arg_scraping_sources["ts"]:
            ts_thread = TwitterScraper(arg_searchbar_text)
            ts_thread.start()
        if arg_scraping_sources["rs"]:
            rs_thread = RedditScraper(arg_searchbar_text)
            rs_thread.start()
        if arg_scraping_sources["ps"]:
            ps_thread = PastebinScrapper(arg_searchbar_text)
            ps_thread.start()

        # join them scraper threads
        if arg_scraping_sources["ts"]:
            ts_thread.join()
        if arg_scraping_sources["rs"]:
            rs_thread.join()
        if arg_scraping_sources["ps"]:
            ps_thread.join()
