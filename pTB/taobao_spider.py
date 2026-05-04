import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import threading
import os
import csv
import webbrowser
from datetime import datetime
from PIL import Image, ImageTk
import config
from spider import TaobaoSpider
from database import Database


class ImagePreviewWindow(tk.Toplevel):
    def __init__(self, parent, product):
        super().__init__(parent)
        self.title('商品图片预览')
        self.geometry('600x700')
        self.product = product
        self.spider = TaobaoSpider()
        self.setup_ui()
        self.load_image()
        
    def setup_ui(self):
        main_frame = ttk.Frame(self, padding='10')
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        info_frame = ttk.LabelFrame(main_frame, text='商品信息', padding='5')
        info_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(info_frame, text=f'商品名称: {self.product.get("product_name", "")}', wraplength=550).pack(anchor=tk.W)
        ttk.Label(info_frame, text=f'价格: {self.product.get("price", "")}').pack(anchor=tk.W)
        ttk.Label(info_frame, text=f'店铺: {self.product.get("shop_name", "")}').pack(anchor=tk.W)
        
        link_frame = ttk.Frame(info_frame)
        link_frame.pack(fill=tk.X, pady=(5, 0))
        ttk.Label(link_frame, text='商品链接:').pack(side=tk.LEFT)
        link_btn = ttk.Button(link_frame, text='打开链接', command=self.open_link)
        link_btn.pack(side=tk.LEFT, padx=5)
        
        image_frame = ttk.LabelFrame(main_frame, text='商品图片', padding='5')
        image_frame.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(image_frame, bg='gray')
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        self.img_label = ttk.Label(self.canvas, text='正在加载图片...')
        self.img_label.place(relx=0.5, rely=0.5, anchor=tk.CENTER)
        
    def load_image(self):
        image_url = self.product.get('image_url', '')
        if not image_url:
            self.img_label.config(text='暂无图片')
            return
            
        def _download():
            img_path = self.spider.download_image(image_url)
            self.after(0, lambda: self.display_image(img_path))
            
        thread = threading.Thread(target=_download, daemon=True)
        thread.start()
        
    def display_image(self, img_path):
        if not img_path:
            self.img_label.config(text='图片加载失败')
            return
            
        try:
            img = Image.open(img_path)
            img.thumbnail((550, 550))
            photo = ImageTk.PhotoImage(img)
            
            self.canvas.delete('all')
            self.canvas.create_image(
                self.canvas.winfo_width() // 2,
                self.canvas.winfo_height() // 2,
                anchor=tk.CENTER,
                image=photo
            )
            self.canvas.image = photo
        except Exception as e:
            self.img_label.config(text=f'图片加载失败: {str(e)}')
            
    def open_link(self):
        link = self.product.get('product_link', '')
        if link:
            webbrowser.open(link)


class TaobaoSpiderGUI:
    def __init__(self, root):
        self.root = root
        self.root.title('淘宝商品采集系统 v2.0')
        self.root.geometry('1400x800')
        
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
        
        ttk.Label(main_frame, text='淘宝商品采集系统 v2.0', font=('微软雅黑', 18, 'bold')).grid(row=0, column=0, columnspan=2, pady=(0, 15))
        
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
        
        content_frame = ttk.Frame(main_frame)
        content_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        content_frame.columnconfigure(1, weight=1)
        content_frame.rowconfigure(0, weight=1)
        
        left_frame = ttk.Frame(content_frame)
        left_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        log_frame = ttk.LabelFrame(left_frame, text='采集日志', padding='5')
        log_frame.pack(fill=tk.BOTH, expand=True)
        
        self.log_text = tk.Text(log_frame, wrap=tk.WORD, height=15)
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        log_scroll = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_text.yview)
        log_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=log_scroll.set)
        
        list_frame = ttk.LabelFrame(content_frame, text='商品列表 (双击查看图片)', padding='5')
        list_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        columns = ('product_name', 'shop_name', 'price', 'sales', 'delivery_time')
        self.tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=20)
        
        self.tree.heading('product_name', text='商品名称')
        self.tree.heading('shop_name', text='店铺名称')
        self.tree.heading('price', text='价格')
        self.tree.heading('sales', text='销量')
        self.tree.heading('delivery_time', text='发货时间')
        
        self.tree.column('product_name', width=300)
        self.tree.column('shop_name', width=120)
        self.tree.column('price', width=80)
        self.tree.column('sales', width=100)
        self.tree.column('delivery_time', width=120)
        
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        list_frame.columnconfigure(0, weight=1)
        list_frame.rowconfigure(0, weight=1)
        
        self.tree.bind('<Double-1>', self.on_item_double_click)
        
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
            product.get('delivery_time', '')
        )))
        
    def _enable_controls(self):
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.keyword_entry.config(state=tk.NORMAL)
        self.pages_entry.config(state=tk.NORMAL)
        
    def on_item_double_click(self, event):
        item = self.tree.selection()
        if not item:
            return
            
        index = self.tree.index(item[0])
        if 0 <= index < len(self.products):
            product = self.products[index]
            ImagePreviewWindow(self.root, product)
            
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
            messagebox.showerror('错误', '未安装pandas库，请执行: py -m pip install pandas openpyxl')
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
