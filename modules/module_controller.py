from modules.twitter_scraper import TwitterScraper
from modules.reddit_scraper import RedditScraper
from modules.pastebin_scraper import PastebinScrapper
from modules.feather_reader import FeatherReader


class ModuleController:
    def compile_feather(self):
        """
        Runs the feather reader module
        :return result_df:
        """
        fr = FeatherReader()
        result_df = fr.run()
        return result_df

    def run(self, arg_scraping_sources, arg_searchbar_text, arg_since=None, arg_until=None, arg_limit=None):
        """
        Runs the master scraper which controls the other scraper modules
        :param arg_limit:
        :param arg_until:
        :param arg_since:
        :param arg_scraping_sources:
        :param arg_searchbar_text:
        :return None:
        """
        # start them scraper threads
        if arg_scraping_sources["ts"]:
            ts_thread = TwitterScraper(arg_searchbar_text, arg_since, arg_until, arg_limit)
            ts_thread.start()
        if arg_scraping_sources["rs"]:
            rs_thread = RedditScraper(arg_searchbar_text, arg_since, arg_until, arg_limit)
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

        result_df = self.compile_feather()
