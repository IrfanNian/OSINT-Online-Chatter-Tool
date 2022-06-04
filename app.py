from flask import Flask, render_template, request
from flask.helpers import flash, url_for
from werkzeug.utils import redirect
from modules.module_controller import ModuleController
from modules.module_configurator import ModuleConfigurator
import os
import shutil
import json
import plotly
import plotly.express as px
import pandas as pd

app = Flask(__name__)  # Create the flask object

RESULT_FOLDER = "results"
STATIC_FOLDER = os.path.join("static", "results")


@app.route('/')
def default():
    return render_template('index.html')


@app.route('/results', methods=['POST'])
def results():
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    if not os.path.exists(STATIC_FOLDER):
        os.makedirs(STATIC_FOLDER)
    # cleanup
    shutil.rmtree(RESULT_FOLDER)
    os.makedirs(RESULT_FOLDER)
    shutil.rmtree(STATIC_FOLDER)
    os.makedirs(STATIC_FOLDER)
    if request.method == "POST":
        # configure settings
        searchbar_text = request.form['keyword']
        chosen_sources = request.form['platf']
        time_range = request.form['timeRangeDrop']
        depth_range = request.form['depthDrop']
        mcr = ModuleConfigurator()
        scraping_sources = mcr.configure_sources(chosen_sources)
        if time_range == "custom":
            since_date = request.form['customTimeStart']
            until_date = request.form['customTimeEnd']
            since, until = mcr.configure_custom_date(since_date, until_date)
        else:
            since, until = mcr.configure_date(time_range)
        limit = mcr.configure_depth(depth_range)
        # run modules
        mc = ModuleController()
        mc.run(scraping_sources, searchbar_text, since, until, limit)
    
    df = pd.read_csv('static/results/results_compiled.csv')
    fig = px.histogram(df, x="time", color="platform",)
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return render_template('results.html', graphJSON=graphJSON)


if __name__ == '__main__':
    app.run()
