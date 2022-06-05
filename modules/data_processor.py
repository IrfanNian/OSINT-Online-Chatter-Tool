import pandas as pd
import os

pd.set_option("display.max_rows", None, "display.max_columns", None)

CWD = os.getcwd()
STATIC_FOLDER = os.path.join("static", "results")


class DataProcessor:
    def __init__(self, arg_df):
        self.arg_df = arg_df

    def bubble_chart(self):
        bubble_chart_df = self.arg_df.copy()
        bubble_chart_df['time'] = pd.to_datetime(bubble_chart_df['time']).dt.date
        bubble_chart_df['date_count'] = bubble_chart_df.time.map(bubble_chart_df.groupby('time').size())
        bubble_chart_df.drop_duplicates(subset=['time'], inplace=True)
        bubble_chart_df.reset_index(drop=True, inplace=True)
        bubble_chart_df = bubble_chart_df.loc[:, ['time', 'date_count']]
        bubble_chart_df.rename(columns={'time': 'time_count'}, inplace=True)
        bubble_chart_df = pd.concat([bubble_chart_df, self.arg_df], axis=1)
        bubble_chart_df.to_csv(os.path.join(CWD, STATIC_FOLDER, "bubble.csv"), sep=",", index=False)

    def run(self):
        self.bubble_chart()


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
# print(bubble_chart_df)
# bubble_chart_df.to_csv(os.path.join(CWD,  "bubble.csv"), sep=",", index=False)
# df.to_csv(os.path.join(CWD,  "df.csv"), sep=",", index=False)
