import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CACHE_DIR = os.path.join(DATA_DIR, 'cache')
CONFIG_FILE = os.path.join(BASE_DIR, 'config.json')

if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

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
    },
    'browser': {
        'headless': False,
        'disable_images': False
    },
    'proxy': {
        'enabled': False,
        'pool': []
    },
    'user_agents': [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ]
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
