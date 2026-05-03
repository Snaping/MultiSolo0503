import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import threading
import os
import csv
from datetime import datetime
import config
from spider import TaobaoSpider
from database import Database


class TaobaoSpiderGUI:
    def __init__(self, root):
        self.root = root
        self.root.title('淘宝商品采集系统')
        self.root.geometry('1200x700')
        
        self.spider = None
        self.db = Database()
        self.products = []
        self.is_spider_running = False
        
        self.setup_ui()

    def setup_ui(self):
        main_frame = ttk.Frame(self.root, padding='10')
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)

        ttk.Label(main_frame, text='淘宝商品采集系统', font=('微软雅黑', 16, 'bold')).grid(row=0, column=0, columnspan=2, pady=(0, 15))

        control_frame = ttk.LabelFrame(main_frame, text='控制面板', padding='10')
        control_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Label(control_frame, text='搜索关键词:').grid(row=0, column=0, padx=(0, 5), sticky=tk.W)
        self.keyword_entry = ttk.Entry(control_frame, width=30)
        self.keyword_entry.grid(row=0, column=1, padx=(0, 10))
        self.keyword_entry.insert(0, '女装')

        ttk.Label(control_frame, text='采集页数:').grid(row=0, column=2, padx=(0, 5), sticky=tk.W)
        self.pages_entry = ttk.Entry(control_frame, width=10)
        self.pages_entry.grid(row=0, column=3, padx=(0, 10))
        self.pages_entry.insert(0, '1')

        self.start_btn = ttk.Button(control_frame, text='开始采集', command=self.start_spider)
        self.start_btn.grid(row=0, column=4, padx=(0, 5))

        self.stop_btn = ttk.Button(control_frame, text='停止采集', command=self.stop_spider, state=tk.DISABLED)
        self.stop_btn.grid(row=0, column=5, padx=(0, 5))

        ttk.Button(control_frame, text='导出CSV', command=self.export_csv).grid(row=0, column=6, padx=(0, 5))
        ttk.Button(control_frame, text='导出Excel', command=self.export_excel).grid(row=0, column=7, padx=(0, 5))
        ttk.Button(control_frame, text='清空列表', command=self.clear_list).grid(row=0, column=8)

        log_frame = ttk.LabelFrame(main_frame, text='采集日志', padding='5')
        log_frame.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)

        self.log_text = tk.Text(log_frame, wrap=tk.WORD, height=10)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        log_scroll = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_text.yview)
        log_scroll.grid(row=0, column=1, sticky=(tk.N, tk.S))
        self.log_text.config(yscrollcommand=log_scroll.set)

        list_frame = ttk.LabelFrame(main_frame, text='商品列表', padding='5')
        list_frame.grid(row=2, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        list_frame.columnconfigure(0, weight=1)
        list_frame.rowconfigure(0, weight=1)

        columns = ('product_name', 'shop_name', 'price', 'sales', 'delivery_time', 'product_link')
        self.tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=15)

        self.tree.heading('product_name', text='商品名称')
        self.tree.heading('shop_name', text='店铺名称')
        self.tree.heading('price', text='价格')
        self.tree.heading('sales', text='销量')
        self.tree.heading('delivery_time', text='发货时间')
        self.tree.heading('product_link', text='商品链接')

        self.tree.column('product_name', width=200)
        self.tree.column('shop_name', width=100)
        self.tree.column('price', width=80)
        self.tree.column('sales', width=80)
        self.tree.column('delivery_time', width=100)
        self.tree.column('product_link', width=200)

        self.tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        tree_scroll = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.tree.yview)
        tree_scroll.grid(row=0, column=1, sticky=(tk.N, tk.S))
        self.tree.config(yscrollcommand=tree_scroll.set)

    def log(self, message):
        self.log_text.insert(tk.END, message + '\n')
        self.log_text.see(tk.END)
        self.root.update_idletasks()

    def start_spider(self):
        keyword = self.keyword_entry.get().strip()
        if not keyword:
            messagebox.showwarning('警告', '请输入搜索关键词')
            return

        try:
            pages = int(self.pages_entry.get())
            if pages < 1:
                raise ValueError()
        except ValueError:
            messagebox.showwarning('警告', '请输入有效的采集页数')
            return

        self.is_spider_running = True
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.keyword_entry.config(state=tk.DISABLED)
        self.pages_entry.config(state=tk.DISABLED)

        thread = threading.Thread(target=self._spider_thread, args=(keyword, pages))
        thread.daemon = True
        thread.start()

    def _spider_thread(self, keyword, pages):
        self.spider = TaobaoSpider(callback=self.log)
        products = self.spider.search_products(keyword, pages)
        
        self.products.extend(products)
        
        for product in products:
            self._insert_to_tree(product)
            if config.load_config().get('db_enabled', False):
                self.db.insert_product(product)

        self.is_spider_running = False
        self.root.after(0, self._enable_controls)

    def _insert_to_tree(self, product):
        self.root.after(0, lambda: self.tree.insert('', tk.END, values=(
            product.get('product_name', ''),
            product.get('shop_name', ''),
            product.get('price', ''),
            product.get('sales', ''),
            product.get('delivery_time', ''),
            product.get('product_link', '')
        )))

    def _enable_controls(self):
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.keyword_entry.config(state=tk.NORMAL)
        self.pages_entry.config(state=tk.NORMAL)

    def stop_spider(self):
        if self.spider:
            self.spider.stop()

    def export_csv(self):
        if not self.products:
            messagebox.showwarning('警告', '没有可导出的数据')
            return

        filename = f'taobao_products_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        filepath = os.path.join(config.DATA_DIR, filename)
        
        try:
            with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=['product_name', 'shop_name', 'price', 'sales', 'delivery_time', 'product_link', 'image_url'])
                writer.writeheader()
                for product in self.products:
                    writer.writerow(product)
            
            messagebox.showinfo('成功', f'CSV文件已导出到:\n{filepath}')
            self.log(f'导出CSV成功: {filepath}')
        except Exception as e:
            messagebox.showerror('错误', f'导出失败: {str(e)}')

    def export_excel(self):
        if not self.products:
            messagebox.showwarning('警告', '没有可导出的数据')
            return

        try:
            import pandas as pd
        except ImportError:
            messagebox.showerror('错误', '未安装pandas库，请执行: pip install pandas openpyxl')
            return

        filename = f'taobao_products_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        filepath = os.path.join(config.DATA_DIR, filename)
        
        try:
            df = pd.DataFrame(self.products)
            df = df[['product_name', 'shop_name', 'price', 'sales', 'delivery_time', 'product_link', 'image_url']]
            df.columns = ['商品名称', '店铺名称', '价格', '销量', '发货时间', '商品链接', '商品图片']
            df.to_excel(filepath, index=False, engine='openpyxl')
            
            messagebox.showinfo('成功', f'Excel文件已导出到:\n{filepath}')
            self.log(f'导出Excel成功: {filepath}')
        except Exception as e:
            messagebox.showerror('错误', f'导出失败: {str(e)}')

    def clear_list(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        self.products = []
        self.log('列表已清空')


def main():
    root = tk.Tk()
    app = TaobaoSpiderGUI(root)
    root.mainloop()


if __name__ == '__main__':
    main()
