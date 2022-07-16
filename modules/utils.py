from modules.feather_reader import FeatherReader
import os
import shutil

RESULT_FOLDER = "results"
STATIC_RESULT_FOLDER = os.path.join("static", "results")
UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED_EXTENSIONS_INDEX = {"feather"}
ALLOWED_EXTENSIONS_RS = {"ini"}
ALLOWED_EXTENSIONS_GRAPH = {"json"}
ALLOWED_EXTENSIONS_CONVERTER = {"feather", "csv"}


def cleanup():
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


def allowed_file_index(arg_filename):
    """
    Whitelist validation for file extensions
    :param arg_filename:
    :return:
    """
    return '.' in arg_filename and arg_filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_INDEX


def allowed_file_ini(arg_filename):
    """
    Whitelist validation for file extensions
    :param arg_filename:
    :return:
    """
    return '.' in arg_filename and arg_filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_RS


def allowed_file_json(arg_filename):
    """
    Whitelist validation for file extensions
    :param arg_filename:
    :return:
    """
    return '.' in arg_filename and arg_filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_GRAPH


def allowed_file_converter(arg_filename):
    """
    Whitelist validation for file extensions
    :param arg_filename:
    :return:
    """
    return '.' in arg_filename and arg_filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_CONVERTER


def get_twitter_list_split():
    fr = FeatherReader()
    twitter_users = fr.twitter_user_list()
    if len(twitter_users) % 2 == 0:
        pass
    else:
        twitter_users.append("")
    twitter_users_a = twitter_users[:len(twitter_users) // 2]
    twitter_users_b = twitter_users[len(twitter_users) // 2:]
    return twitter_users_a, twitter_users_b


def get_twitter_list():
    fr = FeatherReader()
    return fr.twitter_user_list()
