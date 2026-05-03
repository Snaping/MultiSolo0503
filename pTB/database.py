import sqlite3
import json
from datetime import datetime
import config

DB_CONFIG = config.load_config()


class Database:
    def __init__(self):
        self.conn = None
        self.connect()
        self.init_tables()

    def connect(self):
        if DB_CONFIG.get('db_enabled', False):
            if DB_CONFIG.get('db_type') == 'sqlite':
                self.conn = sqlite3.connect(DB_CONFIG['sqlite_db'], check_same_thread=False)
            elif DB_CONFIG.get('db_type') == 'mysql':
                try:
                    import pymysql
                    mysql_config = DB_CONFIG.get('mysql', {})
                    self.conn = pymysql.connect(
                        host=mysql_config.get('host', 'localhost'),
                        port=mysql_config.get('port', 3306),
                        user=mysql_config.get('user', 'root'),
                        password=mysql_config.get('password', ''),
                        database=mysql_config.get('database', 'taobao_spider'),
                        charset='utf8mb4',
                        cursorclass=pymysql.cursors.DictCursor
                    )
                except ImportError:
                    print('未安装pymysql，请执行: pip install pymysql')
                    self.conn = None

    def init_tables(self):
        if not self.conn:
            return
        cursor = self.conn.cursor()
        create_table_sql = '''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_link TEXT,
            shop_name TEXT,
            price TEXT,
            delivery_time TEXT,
            product_name TEXT,
            sales TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        '''
        cursor.execute(create_table_sql)
        self.conn.commit()

    def insert_product(self, product):
        if not self.conn:
            return
        cursor = self.conn.cursor()
        sql = '''
        INSERT INTO products (product_link, shop_name, price, delivery_time, product_name, sales, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        '''
        cursor.execute(sql, (
            product.get('product_link', ''),
            product.get('shop_name', ''),
            product.get('price', ''),
            product.get('delivery_time', ''),
            product.get('product_name', ''),
            product.get('sales', ''),
            product.get('image_url', '')
        ))
        self.conn.commit()
        return cursor.lastrowid

    def get_all_products(self):
        if not self.conn:
            return []
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM products ORDER BY created_at DESC')
        return cursor.fetchall()

    def close(self):
        if self.conn:
            self.conn.close()
