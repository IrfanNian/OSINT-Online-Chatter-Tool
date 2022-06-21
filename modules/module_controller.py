from modules.twitter_scraper import TwitterScraper
from modules.reddit_scraper import RedditScraper
from modules.pastebin_scraper import PastebinScrapper
from modules.feather_reader import FeatherReader
from modules.data_processor import DataProcessor
from modules.twitter_friends import TwitterFriends
import multiprocessing


class ModuleController:
    def run(self, arg_scraping_sources, arg_searchbar_text, arg_custom_reddit=None, arg_since=None, arg_until=None,
            arg_limit=None, arg_refinement=None):
        """
        Runs the module controller which controls the other modules
        :param arg_refinement:
        :param arg_limit:
        :param arg_until:
        :param arg_since:
        :param arg_scraping_sources:
        :param arg_searchbar_text:
        :param arg_custom_reddit:
        :return None:
        """
        processes = []
        # start them scraper processes
        if arg_scraping_sources["ts"]:
            ts = TwitterScraper(arg_searchbar_text, arg_custom_reddit, arg_since, arg_until, arg_limit, arg_refinement)
            ts_process = multiprocessing.Process(target=ts.run)
            ts_process.start()
            processes.append(ts_process)
        if arg_scraping_sources["rs"]:
            rs = RedditScraper(arg_searchbar_text, arg_custom_reddit, arg_since, arg_until, arg_limit, arg_refinement)
            rs_process = multiprocessing.Process(target=rs.run)
            rs_process.start()
            processes.append(rs_process)
        if arg_scraping_sources["ps"]:
            ps = PastebinScrapper(arg_searchbar_text, arg_custom_reddit, arg_since, arg_until, arg_refinement)
            ps_process = multiprocessing.Process(target=ps.run)
            ps_process.start()
            processes.append(ps_process)

        # join them scraper processes
        for process in processes:
            process.join()

        fr = FeatherReader()
        result_df = fr.run()
        try:
            twitter_users = fr.twitter_user_list()
            tf = TwitterFriends()
            tf.run(twitter_users)
        except:
            print("twitter friends got problem")
        dp = DataProcessor()
        dp.run(result_df)
