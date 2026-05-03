# 淘宝商品采集系统

一款基于Python开发的淘宝商品信息采集工具，提供图形化界面操作。

## 功能特性

- 商品信息采集：商品链接、店铺名称、价格、发货时间、商品名称、销量、商品图片
- 实时日志显示
- 商品列表展示
- 数据导出（CSV/Excel）
- 支持数据库存储（SQLite/MySQL）
- 支持多页采集
- 可中途停止采集

## 环境要求

- Python 3.7+
- Windows/Linux/macOS

## 安装步骤

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 运行程序：
```bash
python taobao_spider.py
```

## 使用说明

### 1. 基本采集

1. 在"搜索关键词"框输入要搜索的商品关键词
2. 在"采集页数"框设置要采集的页数
3. 点击"开始采集"按钮
4. 实时查看采集日志和商品列表
5. 可随时点击"停止采集"暂停

### 2. 数据导出

- **导出CSV**：点击"导出CSV"按钮，文件会保存到data目录
- **导出Excel**：点击"导出Excel"按钮，需要先安装pandas和openpyxl

### 3. 数据库配置

编辑 `config.json` 文件，配置数据库连接：

```json
{
  "db_enabled": true,
  "db_type": "sqlite",
  "sqlite_db": "data/taobao_spider.db",
  "mysql": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "taobao_spider"
  }
}
```

- `db_enabled`：设置为true启用数据库存储
- `db_type`：选择数据库类型（sqlite或mysql）
- 使用MySQL时需要先安装pymysql：`pip install pymysql`

## 项目结构

```
pTB/
├── taobao_spider.py    # 主程序入口（GUI界面）
├── spider.py           # 爬虫核心模块
├── database.py         # 数据库模块
├── config.py           # 配置管理
├── config.json         # 配置文件（自动生成）
├── requirements.txt    # 依赖文件
├── README.md           # 说明文档
└── data/               # 数据存储目录
    └── taobao_spider.db (SQLite数据库)
```

## 采集字段说明

| 字段 | 说明 |
|------|------|
| product_name | 商品名称 |
| shop_name | 店铺名称 |
| price | 价格 |
| sales | 销量 |
| delivery_time | 发货时间 |
| product_link | 商品链接 |
| image_url | 商品图片 |

## 注意事项

1. 当前版本为模拟数据演示，真实淘宝采集需要处理反爬机制
2. 采集数据请遵守淘宝服务条款和robots.txt规定
3. 合理设置采集间隔，避免对目标网站造成压力

## 技术栈

- GUI: tkinter
- HTTP: requests
- 数据处理: pandas
- Excel: openpyxl
- 数据库: sqlite3 / pymysql
