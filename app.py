from flask import Flask, render_template, request
from flask.helpers import flash, url_for
from werkzeug.utils import redirect
from scrapers.master_scraper import MasterScraper
import os

app = Flask(__name__)  # Create the flask object

RESULT_FOLDER = "results"
ENABLED_SCRAPING_SOURCES = {
    "ts": True,
    "rs": True,
    "ps": True
}


@app.route('/')
def default():
    # this is here for now
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    return render_template('index.html')


@app.route('/results', methods=['POST'])
def results():
    if request.method == "POST":
        searchbar_text = request.form['keyword']
        ms = MasterScraper()
        ms.run(ENABLED_SCRAPING_SOURCES, searchbar_text)
    return render_template('results.html')


if __name__ == '__main__':
    app.run()
