from flask import Flask, render_template, request
from flask.helpers import flash, url_for
from werkzeug.utils import redirect
from modules.module_controller import ModuleController
from modules.module_configurator import ModuleConfigurator
import os
import shutil

app = Flask(__name__)  # Create the flask object

RESULT_FOLDER = "results"


@app.route('/')
def default():
    return render_template('index.html')


@app.route('/results', methods=['POST'])
def results():
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    # cleanup
    shutil.rmtree(RESULT_FOLDER)
    os.makedirs(RESULT_FOLDER)
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
    return render_template('results.html')


if __name__ == '__main__':
    app.run()
