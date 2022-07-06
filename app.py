from flask import Flask, render_template, request, send_file, session
from werkzeug.utils import secure_filename
from modules.module_controller import ModuleController
from modules.module_configurator import ModuleConfigurator
from modules.utils import allowed_file_index, get_twitter_list, get_twitter_list_split, allowed_file_ini, allowed_file_json
from modules.twitter_relationship import TwitterFriends
import os
import shutil
import datetime as dt
from io import BytesIO
import zipfile
import secrets

RESULT_FOLDER = "results"
STATIC_RESULT_FOLDER = os.path.join("static", "results")
UPLOAD_FOLDER = os.path.join("static", "uploads")
DEMO_FOLDER = "demo"

app = Flask(__name__)  # Create the flask object
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = secrets.token_hex(24)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


@app.route('/')
def default():
    return render_template('index.html')


@app.route('/relationships')
def relationships():
    twitter_users_a, twitter_users_b = get_twitter_list_split()
    return render_template('relationships.html', twitter_users_a=twitter_users_a, twitter_users_b=twitter_users_b)


@app.route('/rs_uploader', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['file']
        if f.filename != "" and allowed_file_json(f.filename):
            filename = secure_filename(f.filename)
            f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            shutil.copy(os.path.join(app.config['UPLOAD_FOLDER'], filename), STATIC_RESULT_FOLDER)
            old_filename = os.path.join(STATIC_RESULT_FOLDER, filename)
            new_filename = os.path.join(STATIC_RESULT_FOLDER, "twitter_friendship.json")
            os.rename(old_filename, new_filename)
            return render_template('relationship_results.html', error="File Uploaded Successfully")
        else:
            return render_template('relationship_results.html', error="File Uploaded Failed")


@app.route('/relationship_results', methods=['POST'])
def relationship_results():
    if request.method == "POST":
        credentials = "config.ini"
        twitter_users = get_twitter_list()
        searchbar_text = request.form.get('keyword')
        level = request.form.get('level', type=int)
        demo_mode = request.form.get('demoMode')
        if demo_mode == "demoMode":
            source = os.path.join(DEMO_FOLDER, "twitter_friendship.json")
            destination = os.path.join(STATIC_RESULT_FOLDER, "twitter_friendship.json")
            shutil.copy(source, destination)
            return render_template('relationship_results.html', title="Demo Mode")
        if searchbar_text not in twitter_users:
            twitter_users_a, twitter_users_b = get_twitter_list_split()
            error = "User is not in the results record"
            return render_template('/relationships.html', twitter_users_a=twitter_users_a,
                                   twitter_users_b=twitter_users_b, error=error)
        if "ini_file" not in request.files:
            twitter_users_a, twitter_users_b = get_twitter_list_split()
            error = "Uploading of ini credential file is mandatory"
            return render_template('/relationships.html', twitter_users_a=twitter_users_a,
                                   twitter_users_b=twitter_users_b, error=error)
        else:
            for f in request.files.getlist("ini_file"):
                if f.filename != "" and allowed_file_ini(f.filename):
                    filename = secure_filename(f.filename)
                    f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    credentials = filename
                elif f.filename != "" and not allowed_file_index(f.filename):
                    twitter_users_a, twitter_users_b = get_twitter_list_split()
                    error = "Invalid filetype/filename"
                    return render_template('/relationships.html', twitter_users_a=twitter_users_a,
                                           twitter_users_b=twitter_users_b, error=error)
        tf = TwitterFriends(credentials)
        tf.run(searchbar_text, level)
        return render_template('relationship_results.html', title=searchbar_text)
    else:
        twitter_users_a, twitter_users_b = get_twitter_list_split()
        return render_template('relationships.html', twitter_users_a=twitter_users_a, twitter_users_b=twitter_users_b)


@app.route('/download', methods=['GET', 'POST'])
def download_data():
    if request.method == "POST":
        timestamp = dt.datetime.now().timestamp()
        try:
            keyword = session['keyword']
        except KeyError:
            keyword = "key_missing"
        filename = keyword + "_result_%s.zip" % timestamp
        if os.path.isfile(os.path.join(STATIC_RESULT_FOLDER, "twitter_friendship.json")):
            shutil.copy(os.path.join(STATIC_RESULT_FOLDER, "twitter_friendship.json"), RESULT_FOLDER)
        memory_file = BytesIO()
        with zipfile.ZipFile(memory_file, "w", zipfile.ZIP_DEFLATED) as f:
            for root, dirs, files in os.walk(RESULT_FOLDER):
                for file in files:
                    f.write(os.path.join(root, file))
        memory_file.seek(0)
        return send_file(memory_file, download_name=filename, as_attachment=True)
    else:
        return render_template('index.html')


@app.route('/results', methods=['POST'])
def results():
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    if not os.path.exists(STATIC_RESULT_FOLDER):
        os.makedirs(STATIC_RESULT_FOLDER)
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    shutil.rmtree(RESULT_FOLDER)
    os.makedirs(RESULT_FOLDER)
    shutil.rmtree(STATIC_RESULT_FOLDER)
    os.makedirs(STATIC_RESULT_FOLDER)
    shutil.rmtree(UPLOAD_FOLDER)
    os.makedirs(UPLOAD_FOLDER)
    if request.method == "POST":
        searchbar_text = request.form.get('keyword')
        chosen_sources = request.form.get('platf')
        custom_subreddit = request.form.get('csubrtext')
        time_range = request.form.get('timeRangeDrop')
        depth_range = request.form.get('depthDrop')
        refinement = request.form.get('refinement')
        master_switch = request.form.get('disableScraping')
        if master_switch == "disableScraping":
            title = "Scraping Disabled"
        else:
            title = searchbar_text + " | Keyword Usage"
        if "file" in request.files:
            for f in request.files.getlist("file"):
                if f.filename != "" and allowed_file_index(f.filename):
                    filename = secure_filename(f.filename)
                    f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    if master_switch == "disableScraping":
                        searchbar_text = filename.split("_")[0]
                elif f.filename != "" and not allowed_file_index(f.filename):
                    error = "Invalid filetype"
                    return render_template('index.html', error=error)
        mcr = ModuleConfigurator()
        session['keyword'] = searchbar_text
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
        mc = ModuleController()
        mc.run(scraping_sources, searchbar_text, custom_subreddit, since, until, limit, refinement)
        return render_template('results.html', title=title, result=searchbar_text)
    else:
        return render_template('index.html')


if __name__ == '__main__':
    app.run()
