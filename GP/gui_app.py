import sys
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTabWidget, QTableWidget, QTableWidgetItem, QPushButton,
    QLineEdit, QLabel, QComboBox, QMessageBox, QProgressBar,
    QSplitter, QHeaderView, QGroupBox, QScrollArea
)
from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QFont, QIcon, QPalette, QColor

from recommendation.recommendation_service import RecommendationService

class RecommendationWorker(QThread):
    finished = Signal(list)
    error = Signal(str)
    
    def __init__(self, service, method_name, *args):
        super().__init__()
        self.service = service
        self.method_name = method_name
        self.args = args
    
    def run(self):
        try:
            method = getattr(self.service, self.method_name)
            result = method(*self.args)
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.service = RecommendationService()
        self.init_ui()
    
    def init_ui(self):
        self.setWindowTitle("量化交易推荐工具")
        self.setGeometry(100, 100, 1000, 700)
        
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
            QTabWidget::pane {
                border: 1px solid #ddd;
                background: white;
            }
            QTabBar::tab {
                background: #e0e0e0;
                padding: 8px 16px;
                margin-right: 4px;
                border-radius: 4px 4px 0 0;
            }
            QTabBar::tab:selected {
                background: white;
                border-bottom: 2px solid #1a73e8;
            }
            QPushButton {
                background-color: #1a73e8;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #1557b0;
            }
            QTableWidget {
                border: 1px solid #ddd;
                gridline-color: #eee;
            }
            QTableWidget::item {
                padding: 8px;
            }
            QHeaderView::section {
                background-color: #f8f9fa;
                padding: 8px;
                font-weight: bold;
                border: none;
                border-bottom: 2px solid #ddd;
            }
            QGroupBox {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 12px;
                font-weight: bold;
            }
            QLineEdit {
                padding: 6px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            QComboBox {
                padding: 6px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
        """)
        
        self.status_bar = self.statusBar()
        self.status_bar.showMessage("就绪")
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        
        self.tab_widget = QTabWidget()
        self.tab_widget.addTab(self.create_stock_tab(), "股票推荐")
        self.tab_widget.addTab(self.create_fund_tab(), "基金推荐")
        self.tab_widget.addTab(self.create_futures_tab(), "期货推荐")
        self.tab_widget.addTab(self.create_risk_tab(), "风险筛选")
        self.tab_widget.addTab(self.create_analysis_tab(), "标的分析")
        
        main_layout.addWidget(self.tab_widget)
    
    def create_stock_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        top_bar = QHBoxLayout()
        self.stock_limit = QComboBox()
        self.stock_limit.addItems(["5", "10", "20"])
        self.stock_limit.setCurrentText("10")
        refresh_btn = QPushButton("刷新推荐")
        refresh_btn.clicked.connect(self.refresh_stock_recommendations)
        
        top_bar.addWidget(QLabel("显示数量:"))
        top_bar.addWidget(self.stock_limit)
        top_bar.addStretch()
        top_bar.addWidget(refresh_btn)
        
        self.stock_table = QTableWidget()
        self.stock_table.setColumnCount(6)
        self.stock_table.setHorizontalHeaderLabels(["排名", "代码", "名称", "评分", "推荐等级", "风险等级"])
        self.stock_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        
        layout.addLayout(top_bar)
        layout.addWidget(self.stock_table)
        
        self.refresh_stock_recommendations()
        return tab
    
    def create_fund_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        top_bar = QHBoxLayout()
        self.fund_limit = QComboBox()
        self.fund_limit.addItems(["5", "10", "15"])
        self.fund_limit.setCurrentText("10")
        refresh_btn = QPushButton("刷新推荐")
        refresh_btn.clicked.connect(self.refresh_fund_recommendations)
        
        top_bar.addWidget(QLabel("显示数量:"))
        top_bar.addWidget(self.fund_limit)
        top_bar.addStretch()
        top_bar.addWidget(refresh_btn)
        
        self.fund_table = QTableWidget()
        self.fund_table.setColumnCount(6)
        self.fund_table.setHorizontalHeaderLabels(["排名", "代码", "名称", "评分", "推荐等级", "风险等级"])
        self.fund_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        
        layout.addLayout(top_bar)
        layout.addWidget(self.fund_table)
        
        self.refresh_fund_recommendations()
        return tab
    
    def create_futures_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        top_bar = QHBoxLayout()
        self.futures_limit = QComboBox()
        self.futures_limit.addItems(["5", "10", "15"])
        self.futures_limit.setCurrentText("10")
        refresh_btn = QPushButton("刷新推荐")
        refresh_btn.clicked.connect(self.refresh_futures_recommendations)
        
        top_bar.addWidget(QLabel("显示数量:"))
        top_bar.addWidget(self.futures_limit)
        top_bar.addStretch()
        top_bar.addWidget(refresh_btn)
        
        self.futures_table = QTableWidget()
        self.futures_table.setColumnCount(6)
        self.futures_table.setHorizontalHeaderLabels(["排名", "代码", "名称", "评分", "推荐等级", "风险等级"])
        self.futures_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        
        layout.addLayout(top_bar)
        layout.addWidget(self.futures_table)
        
        self.refresh_futures_recommendations()
        return tab
    
    def create_risk_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        top_bar = QHBoxLayout()
        self.risk_combo = QComboBox()
        self.risk_combo.addItems(["低风险", "中风险", "中高风险", "高风险"])
        filter_btn = QPushButton("筛选")
        filter_btn.clicked.connect(self.filter_by_risk)
        
        top_bar.addWidget(QLabel("风险等级:"))
        top_bar.addWidget(self.risk_combo)
        top_bar.addStretch()
        top_bar.addWidget(filter_btn)
        
        self.risk_table = QTableWidget()
        self.risk_table.setColumnCount(7)
        self.risk_table.setHorizontalHeaderLabels(["排名", "类型", "代码", "名称", "评分", "推荐等级", "风险等级"])
        self.risk_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        
        layout.addLayout(top_bar)
        layout.addWidget(self.risk_table)
        
        return tab
    
    def create_analysis_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        input_group = QGroupBox("输入标的信息")
        input_layout = QHBoxLayout(input_group)
        
        type_combo = QComboBox()
        type_combo.addItems(["股票", "基金", "期货"])
        self.analysis_type = type_combo
        
        self.symbol_input = QLineEdit()
        self.symbol_input.setPlaceholderText("输入代码 (如 AAPL, 161725, CL=F)")
        
        analyze_btn = QPushButton("分析")
        analyze_btn.clicked.connect(self.analyze_symbol)
        
        input_layout.addWidget(QLabel("类型:"))
        input_layout.addWidget(type_combo)
        input_layout.addWidget(self.symbol_input)
        input_layout.addWidget(analyze_btn)
        
        result_group = QGroupBox("分析结果")
        result_layout = QVBoxLayout(result_group)
        
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        self.result_widget = QWidget()
        self.result_layout = QVBoxLayout(self.result_widget)
        scroll_area.setWidget(self.result_widget)
        
        result_layout.addWidget(scroll_area)
        
        layout.addWidget(input_group)
        layout.addWidget(result_group)
        
        return tab
    
    def refresh_stock_recommendations(self):
        limit = int(self.stock_limit.currentText())
        self.status_bar.showMessage("正在获取股票推荐...")
        
        self.worker = RecommendationWorker(self.service, 'get_stock_recommendations', limit)
        self.worker.finished.connect(self.update_stock_table)
        self.worker.error.connect(self.show_error)
        self.worker.start()
    
    def update_stock_table(self, recommendations):
        self.stock_table.setRowCount(len(recommendations))
        for i, rec in enumerate(recommendations):
            rec_dict = rec.to_dict()
            self.stock_table.setItem(i, 0, QTableWidgetItem(str(i+1)))
            self.stock_table.setItem(i, 1, QTableWidgetItem(rec_dict['symbol']))
            self.stock_table.setItem(i, 2, QTableWidgetItem(rec_dict['name']))
            self.stock_table.setItem(i, 3, QTableWidgetItem(f"{rec_dict['score']:.2f}"))
            
            item = QTableWidgetItem(rec_dict['recommendation'])
            self.set_recommendation_color(item, rec_dict['recommendation'])
            self.stock_table.setItem(i, 4, item)
            
            item = QTableWidgetItem(rec_dict['risk_level'])
            self.set_risk_color(item, rec_dict['risk_level'])
            self.stock_table.setItem(i, 5, item)
        
        self.status_bar.showMessage("股票推荐已更新")
    
    def refresh_fund_recommendations(self):
        limit = int(self.fund_limit.currentText())
        self.status_bar.showMessage("正在获取基金推荐...")
        
        self.worker = RecommendationWorker(self.service, 'get_fund_recommendations', limit)
        self.worker.finished.connect(self.update_fund_table)
        self.worker.error.connect(self.show_error)
        self.worker.start()
    
    def update_fund_table(self, recommendations):
        self.fund_table.setRowCount(len(recommendations))
        for i, rec in enumerate(recommendations):
            rec_dict = rec.to_dict()
            self.fund_table.setItem(i, 0, QTableWidgetItem(str(i+1)))
            self.fund_table.setItem(i, 1, QTableWidgetItem(rec_dict['symbol']))
            self.fund_table.setItem(i, 2, QTableWidgetItem(rec_dict['name']))
            self.fund_table.setItem(i, 3, QTableWidgetItem(f"{rec_dict['score']:.2f}"))
            
            item = QTableWidgetItem(rec_dict['recommendation'])
            self.set_recommendation_color(item, rec_dict['recommendation'])
            self.fund_table.setItem(i, 4, item)
            
            item = QTableWidgetItem(rec_dict['risk_level'])
            self.set_risk_color(item, rec_dict['risk_level'])
            self.fund_table.setItem(i, 5, item)
        
        self.status_bar.showMessage("基金推荐已更新")
    
    def refresh_futures_recommendations(self):
        limit = int(self.futures_limit.currentText())
        self.status_bar.showMessage("正在获取期货推荐...")
        
        self.worker = RecommendationWorker(self.service, 'get_futures_recommendations', limit)
        self.worker.finished.connect(self.update_futures_table)
        self.worker.error.connect(self.show_error)
        self.worker.start()
    
    def update_futures_table(self, recommendations):
        self.futures_table.setRowCount(len(recommendations))
        for i, rec in enumerate(recommendations):
            rec_dict = rec.to_dict()
            self.futures_table.setItem(i, 0, QTableWidgetItem(str(i+1)))
            self.futures_table.setItem(i, 1, QTableWidgetItem(rec_dict['symbol']))
            self.futures_table.setItem(i, 2, QTableWidgetItem(rec_dict['name']))
            self.futures_table.setItem(i, 3, QTableWidgetItem(f"{rec_dict['score']:.2f}"))
            
            item = QTableWidgetItem(rec_dict['recommendation'])
            self.set_recommendation_color(item, rec_dict['recommendation'])
            self.futures_table.setItem(i, 4, item)
            
            item = QTableWidgetItem(rec_dict['risk_level'])
            self.set_risk_color(item, rec_dict['risk_level'])
            self.futures_table.setItem(i, 5, item)
        
        self.status_bar.showMessage("期货推荐已更新")
    
    def filter_by_risk(self):
        risk_level = self.risk_combo.currentText()
        self.status_bar.showMessage(f"正在筛选{risk_level}标的...")
        
        self.worker = RecommendationWorker(self.service, 'get_recommendations_by_risk', risk_level, 10)
        self.worker.finished.connect(self.update_risk_table)
        self.worker.error.connect(self.show_error)
        self.worker.start()
    
    def update_risk_table(self, recommendations):
        self.risk_table.setRowCount(len(recommendations))
        for i, rec in enumerate(recommendations):
            self.risk_table.setItem(i, 0, QTableWidgetItem(str(i+1)))
            self.risk_table.setItem(i, 1, QTableWidgetItem(rec['type']))
            self.risk_table.setItem(i, 2, QTableWidgetItem(rec['symbol']))
            self.risk_table.setItem(i, 3, QTableWidgetItem(rec['name']))
            self.risk_table.setItem(i, 4, QTableWidgetItem(f"{rec['score']:.2f}"))
            
            item = QTableWidgetItem(rec['recommendation'])
            self.set_recommendation_color(item, rec['recommendation'])
            self.risk_table.setItem(i, 5, item)
            
            item = QTableWidgetItem(rec['risk_level'])
            self.set_risk_color(item, rec['risk_level'])
            self.risk_table.setItem(i, 6, item)
        
        self.status_bar.showMessage(f"{self.risk_combo.currentText()}筛选完成")
    
    def analyze_symbol(self):
        symbol_type = self.analysis_type.currentText()
        symbol = self.symbol_input.text().strip()
        
        if not symbol:
            QMessageBox.warning(self, "警告", "请输入标的代码")
            return
        
        self.status_bar.showMessage(f"正在分析{symbol_type} {symbol}...")
        
        method_map = {
            "股票": 'analyze_stock',
            "基金": 'analyze_fund',
            "期货": 'analyze_futures'
        }
        
        self.worker = RecommendationWorker(self.service, method_map[symbol_type], symbol)
        self.worker.finished.connect(self.show_analysis_result)
        self.worker.error.connect(self.show_error)
        self.worker.start()
    
    def show_analysis_result(self, result):
        rec_dict = result.to_dict()
        
        while self.result_layout.count():
            child = self.result_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
        
        info = [
            ("标的代码", rec_dict['symbol']),
            ("标的名称", rec_dict['name']),
            ("评分", f"{rec_dict['score']:.2f}"),
            ("推荐等级", rec_dict['recommendation']),
            ("风险等级", rec_dict['risk_level']),
            ("推荐理由", rec_dict['reason'])
        ]
        
        for label, value in info:
            row = QHBoxLayout()
            row.addWidget(QLabel(f"<b>{label}:</b>"))
            row.addWidget(QLabel(value))
            self.result_layout.addLayout(row)
        
        if rec_dict['data']:
            data_group = QGroupBox("详细指标")
            data_layout = QVBoxLayout(data_group)
            
            for key, value in rec_dict['data'].items():
                if isinstance(value, float):
                    value_str = f"{value:.4f}"
                else:
                    value_str = str(value)
                row = QHBoxLayout()
                row.addWidget(QLabel(f"<b>{key}:</b>"))
                row.addWidget(QLabel(value_str))
                data_layout.addLayout(row)
            
            self.result_layout.addWidget(data_group)
        
        self.status_bar.showMessage("分析完成")
    
    def set_recommendation_color(self, item, recommendation):
        if recommendation == "强烈推荐":
            item.setBackground(QColor(200, 255, 200))
            item.setForeground(QColor(0, 128, 0))
        elif recommendation == "推荐":
            item.setBackground(QColor(230, 255, 230))
            item.setForeground(QColor(0, 100, 0))
        elif recommendation == "观望":
            item.setBackground(QColor(255, 255, 200))
            item.setForeground(QColor(180, 180, 0))
        elif recommendation == "不推荐":
            item.setBackground(QColor(255, 200, 200))
            item.setForeground(QColor(180, 0, 0))
    
    def set_risk_color(self, item, risk_level):
        if risk_level == "低风险":
            item.setBackground(QColor(200, 255, 200))
        elif risk_level == "中风险":
            item.setBackground(QColor(255, 255, 200))
        elif risk_level == "中高风险":
            item.setBackground(QColor(255, 220, 200))
        elif risk_level == "高风险":
            item.setBackground(QColor(255, 200, 200))
    
    def show_error(self, error_msg):
        QMessageBox.critical(self, "错误", f"发生错误: {error_msg}")
        self.status_bar.showMessage("操作失败")

def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()