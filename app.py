import os.path

from flask import Flask, render_template, request
from flask.helpers import flash, url_for
from werkzeug.utils import redirect
from scrapers.twitter_scraper import TwitterScraper
from scrapers.reddit_scraper import RedditScraper
import os

app = Flask(__name__)  # Create the flask object

RESULT_FOLDER = "results"


@app.route('/')
def default():
    # this is here for now
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    return render_template('index.html')


@app.route('/results', methods=['POST'])
def results():
    text = request.form['keyword']
    ts = TwitterScraper()
    ts.run(text)
    rs = RedditScraper()
    rs.scrape(text)
    return render_template('results.html')


if __name__ == '__main__':
    app.run()
    app.scrape()
