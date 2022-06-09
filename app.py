from flask import Flask, render_template, request
from modules.module_controller import ModuleController
from modules.module_configurator import ModuleConfigurator
import os
import shutil

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
        searchbar_text = request.form.get('keyword')
        chosen_sources = request.form.get('platf')
        custom_subreddit = request.form.get('csubrtext')
        time_range = request.form.get('timeRangeDrop')
        depth_range = request.form.get('depthDrop')
        refinement = request.form.get('refinement')
        mcr = ModuleConfigurator()
        scraping_sources = mcr.configure_sources(chosen_sources)
        if time_range == "custom":
            since_date = request.form['customTimeStart']
            until_date = request.form['customTimeEnd']
            since, until = mcr.configure_custom_date(since_date, until_date)
        else:
            if time_range is None:
                time_range = "lastSeven"
            since, until = mcr.configure_date(time_range)
        limit = mcr.configure_depth(depth_range)
        custom_subreddit = mcr.configure_subreddit(custom_subreddit)
        # run modules
        mc = ModuleController()
        mc.run(scraping_sources, searchbar_text, custom_subreddit, since, until, limit, refinement)
    return render_template('results.html')


if __name__ == '__main__':
    app.run()
