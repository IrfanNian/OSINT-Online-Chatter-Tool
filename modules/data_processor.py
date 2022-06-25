import pandas as pd
import os
import re

pd.set_option("display.max_rows", None, "display.max_columns", None)

CWD = os.getcwd()
STATIC_FOLDER = os.path.join("static", "results")


class DataProcessor:
    def write_to_csv(self, arg_df):
        """
        Writes final processed dataframe to csv for client side processing
        :param arg_df:
        :return None:
        """
        arg_df.to_csv(os.path.join(CWD, STATIC_FOLDER, "charting.csv"), sep=",", index=False)

    def bubble_chart(self, arg_df):
        """
        Processes dataframe and adds additional data to support the bubble chart
        :param arg_df:
        :return bubble_chart_df:
        """
        bubble_chart_df = arg_df.copy()
        bubble_chart_df['time'] = pd.to_datetime(bubble_chart_df['time']).dt.date
        bubble_chart_df['date_count'] = bubble_chart_df.time.map(bubble_chart_df.groupby('time').size())
        bubble_chart_df.drop_duplicates(subset=['time'], inplace=True)
        bubble_chart_df.reset_index(drop=True, inplace=True)
        bubble_chart_df = bubble_chart_df.loc[:, ['time', 'date_count']]
        bubble_chart_df.rename(columns={'time': 'time_count'}, inplace=True)
        bubble_chart_df = pd.concat([bubble_chart_df, arg_df], axis=1)
        return bubble_chart_df

    def country_chart(self, arg_df):
        """
        Processes dataframe and adds additional data to support the country bar chart
        :param arg_df:
        :return country_chart_df:
        """
        country_chart_df = arg_df.copy()
        country_chart_df['country_count'] = country_chart_df.location.map(country_chart_df.groupby('location').size())
        country_chart_df.drop_duplicates(subset=['location'], inplace=True)
        country_chart_df.reset_index(drop=True, inplace=True)
        country_chart_df = country_chart_df.loc[:, ['location', 'country_count']]
        country_chart_df.rename(columns={'location': 'location_count'}, inplace=True)
        country_chart_df = pd.concat([country_chart_df, arg_df], axis=1)
        return country_chart_df

    def wordcloud_and_muiltiline(self, arg_df):
        """
        Processes data and generates wordcloud data and multiple line chart data
        :param arg_df:
        :return wordcloud_and_muiltiline_df:
        """
        cp = arg_df.copy()
        cp['date'] = pd.to_datetime(cp['time']).dt.date
        cp.groupby(['date', 'platform']).platform.count()
        cx = cp.groupby(['date', 'platform']).platform.count().reset_index(name="count")

        # Count words
        list_world_counts = []
        for index, row in cp.iterrows():
            if index > 1000:
                break
            try:
                parts = re.findall("[A-Za-z]+", row["text"])
                for part in parts:
                    word = part.lower()
                    if len(word) > 6:
                        i = -1
                        for idx, wordcount in enumerate(list_world_counts):
                            if wordcount[0] == word:
                                i = idx
                                break
                        if i >= 0:
                            list_world_counts[i][1] += 1
                        else:
                            list_world_counts.append([word, 1])
            except:
                pass
        ex = pd.DataFrame(list_world_counts, columns=['Word', 'Count'])
        ex = ex.sort_values(by=['Count'], ascending=False)
        size = 100
        cnt = 0
        # Wordcloud words and sizes
        list_world_counts = []
        for word in ex['Word']:
            list_world_counts.append([word.upper(), size])
            cnt += 1
            if cnt > 50:
                break
            elif cnt > 40:
                size = 30
            elif cnt > 20:
                size = 50
            elif cnt > 8:
                size = 60
            elif cnt > 3:
                size = 80
        fx = pd.DataFrame(list_world_counts, columns=["word", "size"])
        wordcloud_and_muiltiline_df = pd.concat([arg_df, cx], axis=1)
        wordcloud_and_muiltiline_df = pd.concat([wordcloud_and_muiltiline_df, fx], axis=1)

        return wordcloud_and_muiltiline_df

    def run(self, arg_df):
        """
        Runs the data processor module
        :param arg_df:
        :return None:
        """
        bubble_df = self.bubble_chart(arg_df)
        country_df = self.country_chart(bubble_df)
        multi_df = self.wordcloud_and_muiltiline(country_df)
        self.write_to_csv(multi_df)

# debug code ignore
# df = pd.read_csv(os.path.join(CWD, "..", STATIC_FOLDER, "results_compiled.csv"))
#
# bubble_chart_df = df.copy()
#
# bubble_chart_df['time'] = pd.to_datetime(bubble_chart_df['time']).dt.date
#
# bubble_chart_df['date_count'] = bubble_chart_df.time.map(bubble_chart_df.groupby('time').size())
# bubble_chart_df.drop_duplicates(subset=['time'], inplace=True)
# bubble_chart_df.reset_index(drop=True, inplace=True)
# bubble_chart_df = bubble_chart_df.loc[:, ['time', 'date_count']]
# bubble_chart_df.rename(columns={'time': 'time_count'}, inplace=True)
# bubble_chart_df = pd.concat([bubble_chart_df, df], axis=1)
#
# country_chart_df = bubble_chart_df.copy()
# country_chart_df['country_count'] = country_chart_df.location.map(country_chart_df.groupby('location').size())
# country_chart_df.drop_duplicates(subset=['location'], inplace=True)
# country_chart_df.reset_index(drop=True, inplace=True)
# country_chart_df = country_chart_df.loc[:, ['location', 'country_count']]
# country_chart_df = pd.concat([country_chart_df, bubble_chart_df], axis=1)
#
# print(country_chart_df)
# country_chart_df.to_csv(os.path.join(CWD,  "bubble.csv"), sep=",", index=False)
# df.to_csv(os.path.join(CWD,  "df.csv"), sep=",", index=False)
