import requests
import re
import time
import random
from urllib.parse import quote
from datetime import datetime

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'zh-CN,zh;q=0.9',
}


class TaobaoSpider:
    def __init__(self, callback=None):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.callback = callback
        self.is_running = False

    def log(self, message):
        timestamp = datetime.now().strftime('%H:%M:%S')
        if self.callback:
            self.callback(f'[{timestamp}] {message}')
        print(f'[{timestamp}] {message}')

    def search_products(self, keyword, max_pages=1):
        products = []
        self.is_running = True
        
        self.log(f'开始搜索关键词: {keyword}')
        
        for page in range(1, max_pages + 1):
            if not self.is_running:
                break
                
            self.log(f'正在采集第 {page} 页...')
            
            try:
                page_products = self._mock_get_products(keyword, page)
                products.extend(page_products)
                
                self.log(f'第 {page} 页采集完成，获取到 {len(page_products)} 个商品')
                
                if page < max_pages:
                    time.sleep(random.uniform(1, 3))
                    
            except Exception as e:
                self.log(f'采集第 {page} 页时出错: {str(e)}')
        
        self.log(f'采集完成，共获取 {len(products)} 个商品')
        self.is_running = False
        return products

    def _mock_get_products(self, keyword, page):
        products = []
        count = random.randint(8, 15)
        
        for i in range(count):
            product = {
                'product_link': f'https://item.taobao.com/item.htm?id={random.randint(10000000000, 99999999999)}',
                'shop_name': f'{random.choice(["优品", "精选", "特惠", "品质", "时尚"])}店铺{random.randint(1, 100)}号',
                'price': f'{random.randint(10, 999)}.{random.randint(0, 99):02d}',
                'delivery_time': random.choice(['24小时内发货', '48小时内发货', '72小时内发货', '预售7天']),
                'product_name': f'{keyword} {random.choice(["热销款", "新款", "特价", "限量", "精品"])} {random.randint(1, 1000)}',
                'sales': f'{random.randint(1, 9999)}人付款',
                'image_url': f'https://img.alicdn.com/bao/uploaded/i{random.randint(1, 10)}/{random.randint(100000000, 999999999)}.jpg'
            }
            products.append(product)
            time.sleep(0.1)
        
        return products

    def stop(self):
        self.is_running = False
        self.log('正在停止采集...')
