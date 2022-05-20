from flask import Flask, render_template, request
from flask.helpers import flash, url_for
from werkzeug.utils import redirect

app = Flask(__name__)  # Create the flask object


@app.route('/')
def default():
    return render_template('index.html')


@app.route('/results', methods=['POST'])
def results():
    return render_template('results.html')


if __name__ == '__main__':
    app.run()
