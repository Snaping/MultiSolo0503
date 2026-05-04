import time
import random
import os
import hashlib
import requests
from datetime import datetime
from urllib.parse import quote
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import config

class TaobaoSpider:
    def __init__(self, callback=None):
        self.callback = callback
        self.is_running = False
        self.driver = None
        self.cfg = config.load_config()

    def log(self, message):
        timestamp = datetime.now().strftime('%H:%M:%S')
        if self.callback:
            self.callback(f'[{timestamp}] {message}')
        print(f'[{timestamp}] {message}')

    def _get_edge_path(self):
        possible_paths = [
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path
        return None

    def _init_driver(self):
        browser_type = self.cfg.get('browser', {}).get('type', 'edge').lower()

        if browser_type == 'edge' or browser_type == 'msedge':
            return self._init_edge_driver()
        else:
            return self._init_chrome_driver()

    def _init_chrome_driver(self):
        from selenium.webdriver.chrome.service import Service as ChromeService
        from selenium.webdriver.chrome.options import Options as ChromeOptions

        options = ChromeOptions()

        if self.cfg.get('browser', {}).get('headless', False):
            options.add_argument('--headless')

        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)

        user_agent = random.choice(self.cfg.get('user_agents', [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]))
        options.add_argument(f'user-agent={user_agent}')

        if self.cfg.get('browser', {}).get('disable_images', False):
            prefs = {'profile.managed_default_content_settings.images': 2}
            options.add_experimental_option('prefs', prefs)

        chrome_path = self.cfg.get('chrome_path')
        if chrome_path and os.path.exists(chrome_path):
            options.binary_location = chrome_path

        driver_path = self.cfg.get('chromedriver_path')
        if driver_path and os.path.exists(driver_path):
            service = ChromeService(driver_path)
            self.driver = webdriver.Chrome(service=service, options=options)
        else:
            self.driver = webdriver.Chrome(options=options)

        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return True

    def _init_edge_driver(self):
        options = Options()
        edge_path = self._get_edge_path()

        if self.cfg.get('browser', {}).get('headless', False):
            options.add_argument('--headless')

        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)

        user_agent = random.choice(self.cfg.get('user_agents', [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        ]))
        options.add_argument(f'user-agent={user_agent}')

        if edge_path:
            options.binary_location = edge_path

        driver_path = self.cfg.get('edgedriver_path')
        if driver_path and os.path.exists(driver_path):
            service = Service(driver_path)
            self.driver = webdriver.Edge(service=service, options=options)
        else:
            self.driver = webdriver.Edge(options=options)

        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return True

    def search_products(self, keyword, max_pages=1):
        products = []
        self.is_running = True

        self.log('正在初始化浏览器...')

        try:
            self._init_driver()
        except Exception as e:
            self.log(f'浏览器初始化失败: {str(e)}')
            self.is_running = False
            return []

        try:
            self.log(f'正在搜索: {keyword}')
            search_url = f'https://s.taobao.com/search?q={quote(keyword)}'
            self.driver.get(search_url)

            for page in range(1, max_pages + 1):
                if not self.is_running:
                    break

                self.log(f'正在采集第 {page} 页...')

                try:
                    WebDriverWait(self.driver, 20).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-item]'))
                    )

                    page_products = self._parse_page()
                    products.extend(page_products)
                    self.log(f'第 {page} 页采集到 {len(page_products)} 个商品')

                    if page < max_pages:
                        next_btn = self._find_next_button()
                        if next_btn:
                            next_btn.click()
                            time.sleep(random.uniform(3, 6))
                        else:
                            self.log('没有更多页面了')
                            break

                except Exception as e:
                    self.log(f'采集第 {page} 页时出错: {str(e)}')
                    time.sleep(2)

        except Exception as e:
            self.log(f'采集过程出错: {e}')
        finally:
            if self.driver:
                try:
                    self.driver.quit()
                except Exception:
                    pass
            self.is_running = False

        self.log(f'采集完成，共获取 {len(products)} 个商品')
        return products

    def _parse_page(self):
        products = []
        try:
            items = self.driver.find_elements(By.CSS_SELECTOR, '[data-item]')

            for item in items:
                if not self.is_running:
                    break

                try:
                    product = self._parse_item(item)
                    if product:
                        products.append(product)
                        time.sleep(0.1)
                except Exception:
                    continue

        except Exception as e:
            self.log(f'解析页面失败: {e}')

        return products

    def _parse_item(self, item):
        try:
            title_elem = item.find_element(By.CSS_SELECTOR, '.title, [class*="title"], [class*="name"]')
            product_name = title_elem.text.strip()

            price_elem = item.find_element(By.CSS_SELECTOR, '.price, [class*="price"], strong')
            price = price_elem.text.strip()

            shop_elem = item.find_element(By.CSS_SELECTOR, '.shop, [class*="shop"], a[class*="shop"]')
            shop_name = shop_elem.text.strip()

            sales_elem = item.find_elements(By.CSS_SELECTOR, '.deal-cnt, [class*="deal"], [class*="sales"]')
            sales = sales_elem[0].text.strip() if sales_elem else '0人付款'

            link_elem = item.find_element(By.CSS_SELECTOR, 'a[href*="item.taobao"], a[href*="detail"]')
            product_link = link_elem.get_attribute('href')

            img_elem = item.find_element(By.CSS_SELECTOR, 'img')
            image_url = img_elem.get_attribute('src') or img_elem.get_attribute('data-src')

            delivery_time = '24小时内发货'

            return {
                'product_name': product_name,
                'shop_name': shop_name,
                'price': price,
                'delivery_time': delivery_time,
                'product_link': product_link,
                'sales': sales,
                'image_url': image_url
            }

        except Exception:
            return None

    def _find_next_button(self):
        selectors = [
            '.next a',
            '[class*="next"] a',
            '.pagination-next a'
        ]

        for selector in selectors:
            try:
                btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                if btn and btn.is_displayed():
                    return btn
            except Exception:
                continue
        return None

    def download_image(self, image_url, save_dir=None):
        if not image_url:
            return None

        if save_dir is None:
            save_dir = config.CACHE_DIR

        os.makedirs(save_dir, exist_ok=True)

        file_hash = hashlib.md5(image_url.encode('utf-8')).hexdigest()
        ext = '.jpg'
        if '.' in image_url.split('/')[-1]:
            ext = '.' + image_url.split('.')[-1].split('?')[0][:4]

        save_path = os.path.join(save_dir, file_hash + ext)

        if os.path.exists(save_path):
            return save_path

        try:
            headers = {
                'User-Agent': random.choice(self.cfg.get('user_agents', [
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ])),
                'Referer': 'https://www.taobao.com/'
            }
            response = requests.get(image_url, headers=headers, timeout=10)
            response.raise_for_status()

            with open(save_path, 'wb') as f:
                f.write(response.content)

            return save_path
        except Exception as e:
            self.log(f'下载图片失败: {e}')
            return None

    def stop(self):
        self.is_running = False
        self.log('正在停止采集...')
        if self.driver:
            try:
                self.driver.quit()
            except Exception:
                pass
