from flask import Flask, render_template, request
from flask.helpers import flash, url_for
from werkzeug.utils import redirect

app = Flask(__name__)  # Create the flask object


@app.route('/')
def default():
    return render_template('index.html')


@app.route('/pastebin')
def pastebin():
    return render_template('pastebin.html')


@app.route('/twitter')
def twitter():
    return render_template('twitter.html')


@app.route('/reddit')
def reddit():
    return render_template('reddit.html')


if __name__ == '__main__':
    app.run()
