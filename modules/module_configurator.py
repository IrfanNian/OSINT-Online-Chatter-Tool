import datetime as dt
import dateutil.relativedelta

ENABLED_SCRAPING_SOURCES = {
    "ts": True,
    "rs": True,
    "ps": True
}
TODAY = dt.date.today()


class ModuleConfigurator:
    def configure_subreddit(self, arg_subreddit):
        """
        Configure custom subreddit
        :param arg_subreddit:
        :return sub_list:
        """
        sub_list = ['cybersecurity', 'blueteamsec', 'netsec']
        if arg_subreddit is not None and arg_subreddit != "":
            arg_subreddit = arg_subreddit.replace(" ", "")
            if "," in arg_subreddit:
                sub_list = arg_subreddit.split(',')
            else:
                sub_list = [arg_subreddit]
        return sub_list

    def configure_custom_depth(self, arg_depth):
        limit = 10000
        if type(arg_depth) != int:
            return limit
        else:
            limit = arg_depth
        return limit

    def configure_depth(self, arg_depth):
        """
        Configure depth
        :param arg_depth:
        :return limit:
        """
        limit = 10000
        if arg_depth == "quick":
            limit = 10000
        elif arg_depth == "standard":
            limit = 50000
        elif arg_depth == "deep":
            limit = 100000
        return limit

    def configure_custom_date(self, arg_since, arg_until):
        """
        Passing custom date with sanity check
        :param arg_since:
        :param arg_until:
        :return since, until:
        """
        if arg_since is None or arg_since == "":
            arg_since = str(TODAY)
        if arg_until is None or arg_until == "":
            arg_until = str(TODAY)
        since = dt.datetime.strptime(arg_since, '%Y-%m-%d').date()
        until = dt.datetime.strptime(arg_until, '%Y-%m-%d').date()
        if since > TODAY:
            since = TODAY
        if until > TODAY:
            until = TODAY
        if since > until:
            since = until
        return str(since), str(until)

    def configure_date(self, arg_date):
        """
        Translate frontend date range to acceptable backend date format
        :param arg_date:
        :return since date, until date:
        """
        if arg_date == "today":
            return str(TODAY), str(TODAY)
        elif arg_date == "yesterday":
            yesterday = TODAY - dt.timedelta(days=1)
            return str(yesterday), str(TODAY)
        elif arg_date == "lastSeven":
            last_seven = TODAY - dt.timedelta(days=7)
            return str(last_seven), str(TODAY)
        elif arg_date == "lastThirty":
            last_thirty = TODAY - dateutil.relativedelta.relativedelta(months=1)
            return str(last_thirty), str(TODAY)
        elif arg_date == "lastNinty":
            last_ninty = TODAY - dateutil.relativedelta.relativedelta(months=3)
            return str(last_ninty), str(TODAY)
        elif arg_date == "lastSixMth":
            last_six_mth = TODAY - dateutil.relativedelta.relativedelta(months=6)
            return str(last_six_mth), str(TODAY)
        elif arg_date == "lastOneYr":
            last_one_yr = TODAY - dateutil.relativedelta.relativedelta(years=1)
            return str(last_one_yr), str(TODAY)
        else:
            last_seven = TODAY - dt.timedelta(days=7)
            return str(last_seven), str(TODAY)

    def configure_sources(self, arg_reddit, arg_twitter, arg_pastebin, arg_switch):
        """
        Configure sources
        :param arg_pastebin:
        :param arg_twitter:
        :param arg_reddit:
        :param arg_switch:
        :return ENABLED_SCRAPING_SOURCES:
        """
        if arg_switch == "disableScraping":
            ENABLED_SCRAPING_SOURCES['rs'] = False
            ENABLED_SCRAPING_SOURCES['ps'] = False
            ENABLED_SCRAPING_SOURCES['ts'] = False
        else:
            if arg_reddit == "reddit":
                ENABLED_SCRAPING_SOURCES['rs'] = True
            else:
                ENABLED_SCRAPING_SOURCES['rs'] = False
            if arg_twitter == "twitter":
                ENABLED_SCRAPING_SOURCES['ts'] = True
            else:
                ENABLED_SCRAPING_SOURCES['ts'] = False
            if arg_pastebin == "pastebin":
                ENABLED_SCRAPING_SOURCES['ps'] = True
            else:
                ENABLED_SCRAPING_SOURCES['ps'] = False
        return ENABLED_SCRAPING_SOURCES
