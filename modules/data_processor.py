import pandas as pd
import os
import re
from multiprocessing import Process, Manager
import joblib
from collections import Counter

CWD = os.getcwd()
STATIC_FOLDER = os.path.join("static", "results")
MODEL_FOLDER = os.path.join("modules", "models")


class DataProcessor:
    def write_to_csv(self, arg_df):
        """
        Writes final processed dataframe to csv for client side processing
        :param arg_df:
        :return None:
        """
        arg_df.to_csv(os.path.join(CWD, STATIC_FOLDER, "charting.csv"), sep=",", index=False)

    def bubble_chart(self, arg_df, queue):
        """
        Processes dataframe and adds additional data to support the bubble chart
        :param queue:
        :param arg_df:
        :return None:
        """
        bubble_chart_df = arg_df.copy()
        bubble_chart_df['time'] = pd.to_datetime(bubble_chart_df['time']).dt.date
        bubble_chart_df['date_count'] = bubble_chart_df.time.map(bubble_chart_df.groupby('time').size())
        bubble_chart_df.drop_duplicates(subset=['time'], inplace=True)
        bubble_chart_df.reset_index(drop=True, inplace=True)
        bubble_chart_df = bubble_chart_df.loc[:, ['time', 'date_count']]
        bubble_chart_df.rename(columns={'time': 'time_count'}, inplace=True)
        queue.put(bubble_chart_df)
        return

    def country_chart(self, arg_df, queue):
        """
        Processes dataframe and adds additional data to support the country bar chart
        :param queue:
        :param arg_df:
        :return None:
        """
        country_chart_df = arg_df.copy()
        country_chart_df['country_count'] = country_chart_df.location.map(country_chart_df.groupby('location').size())
        country_chart_df.drop_duplicates(subset=['location'], inplace=True)
        country_chart_df.reset_index(drop=True, inplace=True)
        country_chart_df = country_chart_df.loc[:, ['location', 'country_count']]
        country_chart_df.rename(columns={'location': 'location_count'}, inplace=True)
        queue.put(country_chart_df)
        return

    def scatter_chart(self, arg_df, queue):
        """
        Processes dataframe and adds additional data to support the scatter chart
        :param queue:
        :param arg_df:
        :return None:
        """
        scatter_chart_df = arg_df.copy()
        scatter_chart_df['day'] = pd.to_datetime(scatter_chart_df['time']).dt.date
        scatter_chart_df['timeofday'] = pd.to_datetime(scatter_chart_df['time']).dt.time
        scatter_chart_df.reset_index(drop=True, inplace=True)
        scatter_chart_df = scatter_chart_df.loc[:, ['timeofday', 'day']]
        queue.put(scatter_chart_df)
        return

    def wordcloud_and_muiltiline(self, arg_df, queue):
        """
        Processes data and generates wordcloud data and multiple line chart data
        :param queue:
        :param arg_df:
        :return None:
        """
        cp = arg_df.copy()
        cp['date'] = pd.to_datetime(cp['time']).dt.date
        cp.groupby(['date', 'platform']).platform.count()
        cx = cp.groupby(['date', 'platform']).platform.count().reset_index(name="count")
        cx.rename(columns={'platform': 'ml_platform'}, inplace=True)

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
        wordcloud_and_multiline_df = pd.concat([fx, cx], axis=1)
        queue.put(wordcloud_and_multiline_df)
        return

    def detect_usernames_cross_platform(self, arg_df, queue):
        """
        Detects and grab users with same username but in different platforms
        :param queue:
        :param arg_df:
        :return None:
        """
        df = arg_df.copy()
        cross_df = df.groupby(["user"]).platform.nunique().gt(1)
        df = df.loc[df.user.isin(cross_df[cross_df].index)]
        df.reset_index(drop=True, inplace=True)
        df = df.loc[:, ['user', 'platform']]
        df.rename(columns={'user': 'cross_user'}, inplace=True)
        df.rename(columns={'platform': 'cross_platform'}, inplace=True)
        df.sort_values(by='cross_user', inplace=True)
        queue.put(df)
        return

    def category_classifier(self, arg_df, queue):
        """
        Classifies posts into pre-defined categories and generate data to support the category pie chart
        :param arg_df:
        :param queue:
        :return None:
        """
        try:
            clf = joblib.load(os.path.join(MODEL_FOLDER, "classifier_model.pkl"))
            tfidf = joblib.load(os.path.join(MODEL_FOLDER, "classifier_tfidf.pkl"))
        except FileNotFoundError:
            final_df = pd.DataFrame(columns=['uniq_cat', 'cat_count', 'category'])
            queue.put(final_df)
            return
        x_tfidf = tfidf.transform(arg_df['text'].values)
        predicted = clf.predict(x_tfidf)
        count_df = pd.DataFrame(list(zip(Counter(predicted).keys(), Counter(predicted).values())), columns=['uniq_cat', 'cat_count'])
        category_df = pd.DataFrame(list(predicted), columns=['category'])
        final_df = pd.concat([count_df, category_df], axis=1)
        queue.put(final_df)
        return

    def run(self, arg_df):
        """
        Runs the data processor module
        :param arg_df:
        :return None:
        """
        manager = Manager()
        queue = manager.Queue()
        processes = []
        classifier_process = Process(target=self.category_classifier, args=(arg_df, queue))
        classifier_process.start()
        processes.append(classifier_process)
        wm_process = Process(target=self.wordcloud_and_muiltiline, args=(arg_df, queue))
        wm_process.start()
        processes.append(wm_process)
        bc_process = Process(target=self.bubble_chart, args=(arg_df, queue))
        bc_process.start()
        processes.append(bc_process)
        cc_process = Process(target=self.country_chart, args=(arg_df, queue))
        cc_process.start()
        processes.append(cc_process)
        sc_process = Process(target=self.scatter_chart, args=(arg_df, queue))
        sc_process.start()
        processes.append(sc_process)
        cp_process = Process(target=self.detect_usernames_cross_platform, args=(arg_df, queue))
        cp_process.start()
        processes.append(cp_process)
        for process in processes:
            value = queue.get()
            arg_df = pd.concat([value, arg_df], axis=1)
            process.join()
        self.write_to_csv(arg_df)
