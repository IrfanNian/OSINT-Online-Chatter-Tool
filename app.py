from flask import Flask, render_template, request
from flask.helpers import flash, url_for
from werkzeug.utils import redirect
from modules.module_controller import ModuleController
import os
import shutil

app = Flask(__name__)  # Create the flask object

RESULT_FOLDER = "results"
ENABLED_SCRAPING_SOURCES = {
    "ts": True,
    "rs": True,
    "ps": True
}


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
        searchbar_text = request.form['keyword']
        mc = ModuleController()
        mc.run(ENABLED_SCRAPING_SOURCES, searchbar_text)
    return render_template('results.html')


if __name__ == '__main__':
    app.run()
