import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import threading
from git_operations import GitManager
from code_analyzer import CodeAnalyzer
from doc_generator import DocGenerator
import os

class CodeDocGenerator:
    def __init__(self, root):
        self.root = root
        self.root.title("代码文档生成器")
        self.root.geometry("1000x700")
        
        self.git_manager = None
        self.analyzer = None
        self.doc_generator = None
        self.repo_path = ""
        
        self.setup_ui()
    
    def setup_ui(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(4, weight=1)
        
        ttk.Label(main_frame, text="Git仓库URL:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        self.repo_url_entry = ttk.Entry(main_frame, width=60)
        self.repo_url_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=5, pady=5)
        
        ttk.Label(main_frame, text="本地路径:", font=('Arial', 10, 'bold')).grid(row=1, column=0, sticky=tk.W, pady=5)
        self.repo_path_entry = ttk.Entry(main_frame, width=60)
        self.repo_path_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), padx=5, pady=5)
        ttk.Button(main_frame, text="浏览...", command=self.browse_path).grid(row=1, column=2, padx=5)
        
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=2, column=0, columnspan=3, pady=10)
        
        ttk.Button(button_frame, text="克隆/拉取仓库", command=self.clone_repo).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="分析代码结构", command=self.analyze_code).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="生成文档", command=self.generate_doc).pack(side=tk.LEFT, padx=5)
        
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(main_frame, text="日志输出:", font=('Arial', 10, 'bold')).grid(row=4, column=0, sticky=(tk.W, tk.N), pady=5)
        self.log_text = scrolledtext.ScrolledText(main_frame, height=15, wrap=tk.WORD)
        self.log_text.grid(row=4, column=1, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
    
    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.root.update()
    
    def browse_path(self):
        path = filedialog.askdirectory()
        if path:
            self.repo_path_entry.delete(0, tk.END)
            self.repo_path_entry.insert(0, path)
    
    def clone_repo(self):
        repo_url = self.repo_url_entry.get().strip()
        repo_path = self.repo_path_entry.get().strip()
        
        if not repo_url:
            messagebox.showerror("错误", "请输入Git仓库URL")
            return
        
        if not repo_path:
            messagebox.showerror("错误", "请选择本地路径")
            return
        
        def run():
            try:
                self.progress.start()
                self.git_manager = GitManager(repo_path)
                self.log(f"开始处理仓库: {repo_url}")
                
                if os.path.exists(os.path.join(repo_path, ".git")):
                    self.log("仓库已存在，正在拉取最新代码...")
                    self.git_manager.pull()
                    self.repo_path = repo_path
                else:
                    self.log("正在克隆仓库...")
                    self.git_manager.clone(repo_url)
                    self.repo_path = self.git_manager.repo_path
                
                self.log(f"仓库路径: {self.repo_path}")
                self.log("仓库处理完成！")
                messagebox.showinfo("成功", "仓库克隆/拉取成功！")
            except Exception as e:
                self.log(f"错误: {str(e)}")
                messagebox.showerror("错误", str(e))
            finally:
                self.progress.stop()
        
        threading.Thread(target=run, daemon=True).start()
    
    def analyze_code(self):
        if not self.repo_path or not os.path.exists(self.repo_path):
            messagebox.showerror("错误", "请先克隆/拉取仓库")
            return
        
        def run():
            try:
                self.progress.start()
                self.log("开始分析代码结构...")
                self.analyzer = CodeAnalyzer(self.repo_path)
                self.analyzer.analyze()
                self.log("代码分析完成！")
                self.log(f"发现 {len(self.analyzer.modules)} 个模块")
                self.log(f"发现 {len(self.analyzer.classes)} 个类")
                self.log(f"发现 {len(self.analyzer.functions)} 个函数")
                messagebox.showinfo("成功", "代码分析完成！")
            except Exception as e:
                self.log(f"错误: {str(e)}")
                messagebox.showerror("错误", str(e))
            finally:
                self.progress.stop()
        
        threading.Thread(target=run, daemon=True).start()
    
    def generate_doc(self):
        if not self.analyzer:
            messagebox.showerror("错误", "请先分析代码结构")
            return
        
        def run():
            try:
                self.progress.start()
                self.log("开始生成文档...")
                self.doc_generator = DocGenerator(self.analyzer)
                output_path = os.path.join(self.repo_path, "PROJECT_DOCUMENTATION.md")
                self.doc_generator.generate(output_path)
                self.log(f"文档已生成: {output_path}")
                
                self.log("正在生成UML图表...")
                self.doc_generator.generate_uml_diagrams(self.repo_path)
                self.log("UML图表生成完成！")
                
                messagebox.showinfo("成功", f"文档生成成功！\n保存路径: {output_path}")
            except Exception as e:
                self.log(f"错误: {str(e)}")
                messagebox.showerror("错误", str(e))
            finally:
                self.progress.stop()
        
        threading.Thread(target=run, daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = CodeDocGenerator(root)
    root.mainloop()
