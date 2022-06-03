import datetime as dt
import dateutil.relativedelta

ENABLED_SCRAPING_SOURCES = {
    "ts": True,
    "rs": True,
    "ps": True
}


class ModuleConfigurator:
    def configure_subreddit(self, arg_subreddit):
        pass

    def configure_depth(self, arg_depth):
        """
        Configure depth
        :param arg_depth:
        :return limit:
        """
        limit = 500
        if arg_depth == "quick":
            limit = 1000
        elif arg_depth == "standard":
            limit = 10000
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
        today = dt.date.today()
        since = dt.datetime.strptime(arg_since, '%Y-%m-%d').date()
        until = dt.datetime.strptime(arg_until, '%Y-%m-%d').date()
        if since > today:
            since = today
        if until > today:
            until = today
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
            today = dt.date.today()
            return str(today), str(today)
        elif arg_date == "yesterday":
            today = dt.date.today()
            yesterday = today - dt.timedelta(days=1)
            return str(yesterday), str(today)
        elif arg_date == "lastSeven":
            today = dt.date.today()
            last_seven = today - dt.timedelta(days=7)
            return str(last_seven), str(today)
        elif arg_date == "lastThirty":
            today = dt.date.today()
            last_thirty = today - dateutil.relativedelta.relativedelta(months=1)
            return str(last_thirty), str(today)
        elif arg_date == "lastNinty":
            today = dt.date.today()
            last_ninty = today - dateutil.relativedelta.relativedelta(months=3)
            return str(last_ninty), str(today)
        elif arg_date == "lastSixMth":
            today = dt.date.today()
            last_six_mth = today - dateutil.relativedelta.relativedelta(months=6)
            return str(last_six_mth), str(today)
        elif arg_date == "lastOneYr":
            today = dt.date.today()
            last_one_yr = today - dateutil.relativedelta.relativedelta(years=1)
            return str(last_one_yr), str(today)
        else:
            pass

    def configure_sources(self, arg_sources):
        """
        Configure sources
        :param arg_sources:
        :return ENABLED_SCRAPING_SOURCES:
        """
        if arg_sources == "twitter":
            ENABLED_SCRAPING_SOURCES['rs'] = False
            ENABLED_SCRAPING_SOURCES['ps'] = False
        elif arg_sources == "pastebin":
            ENABLED_SCRAPING_SOURCES['rs'] = False
            ENABLED_SCRAPING_SOURCES['ts'] = False
        elif arg_sources == "reddit":
            ENABLED_SCRAPING_SOURCES['ps'] = False
            ENABLED_SCRAPING_SOURCES['ts'] = False
        else:
            pass
        return ENABLED_SCRAPING_SOURCES
