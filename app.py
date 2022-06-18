import flask
from flask import Flask, render_template, request, send_file
from werkzeug.utils import secure_filename
from modules.module_controller import ModuleController
from modules.module_configurator import ModuleConfigurator
import os
import shutil
import datetime as dt
from io import BytesIO
import zipfile

RESULT_FOLDER = "results"
STATIC_RESULT_FOLDER = os.path.join("static", "results")
UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED_EXTENSIONS = {"feather"}

app = Flask(__name__)  # Create the flask object
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(arg_filename):
    return '.' in arg_filename and arg_filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def default():
    return render_template('index.html')


@app.route('/download')
def download_data():
    timestamp = dt.datetime.now().timestamp()
    filename = "result_%s.zip" % timestamp
    memory_file = BytesIO()
    with zipfile.ZipFile(memory_file, "w", zipfile.ZIP_DEFLATED) as f:
        for root, dirs, files in os.walk(RESULT_FOLDER):
            for file in files:
                f.write(os.path.join(root, file))
    memory_file.seek(0)
    return send_file(memory_file, download_name=filename, as_attachment=True)


@app.route('/results', methods=['POST'])
def results():
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    if not os.path.exists(STATIC_RESULT_FOLDER):
        os.makedirs(STATIC_RESULT_FOLDER)
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    # cleanup
    shutil.rmtree(RESULT_FOLDER)
    os.makedirs(RESULT_FOLDER)
    shutil.rmtree(STATIC_RESULT_FOLDER)
    os.makedirs(STATIC_RESULT_FOLDER)
    shutil.rmtree(UPLOAD_FOLDER)
    os.makedirs(UPLOAD_FOLDER)
    if request.method == "POST":
        # configure settings
        searchbar_text = request.form.get('keyword')
        chosen_sources = request.form.get('platf')
        custom_subreddit = request.form.get('csubrtext')
        time_range = request.form.get('timeRangeDrop')
        depth_range = request.form.get('depthDrop')
        refinement = request.form.get('refinement')
        master_switch = request.form.get('disableScraping')
        if "file" in request.files:
            for f in request.files.getlist("file"):
                if f.filename != "" and allowed_file(f.filename):
                    filename = secure_filename(f.filename)
                    f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                elif f.filename != "" and not allowed_file(f.filename):
                    error = "Invalid filetype"
                    return render_template('index.html', error=error)
        mcr = ModuleConfigurator()
        scraping_sources = mcr.configure_sources(chosen_sources, master_switch)
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
