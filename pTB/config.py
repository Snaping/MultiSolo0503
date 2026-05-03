import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CONFIG_FILE = os.path.join(BASE_DIR, 'config.json')

DEFAULT_CONFIG = {
    'db_enabled': False,
    'db_type': 'sqlite',
    'sqlite_db': os.path.join(DATA_DIR, 'taobao_spider.db'),
    'mysql': {
        'host': 'localhost',
        'port': 3306,
        'user': 'root',
        'password': '',
        'database': 'taobao_spider'
    }
}


def load_config():
    if not os.path.exists(CONFIG_FILE):
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)
        return {**DEFAULT_CONFIG, **config}
    except Exception:
        return DEFAULT_CONFIG


def save_config(config):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)
