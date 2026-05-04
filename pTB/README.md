# 淘宝商品采集系统 v2.0

一款基于Python和Selenium开发的淘宝商品信息采集工具，提供图形化界面操作。

## 功能特性

- 商品信息采集：商品链接、店铺名称、价格、发货时间、商品名称、销量、商品图片
- 实时日志显示
- 商品列表展示，双击查看商品详情和图片
- 图片预览功能，支持在线查看和缓存
- 数据导出（CSV/Excel）
- 支持数据库存储（SQLite/MySQL）
- 支持多页采集
- 可中途停止采集
- Selenium浏览器自动化，动态加载页面
- 请求头伪装，随机User-Agent
- 代理IP池支持
- 反爬检测绕过

## 环境要求

- Python 3.7+
- Chrome浏览器
- Windows/Linux/macOS

## 安装步骤

1. 安装依赖：
```bash
py -m pip install -r requirements.txt
```

2. 运行程序：
```bash
py taobao_spider.py
```

## 使用说明

### 1. 基本采集

1. 在"搜索关键词"框输入要搜索的商品关键词
2. 在"采集页数"框设置要采集的页数
3. 点击"开始采集"按钮
4. 实时查看采集日志和商品列表
5. 可随时点击"停止采集"暂停
6. 双击商品列表项查看商品详情和图片预览

### 2. 图片预览

- 双击商品列表中的任意项，打开图片预览窗口
- 在预览窗口中可以查看商品图片
- 点击"打开链接"跳转到淘宝商品页面

### 3. 数据导出

- **导出CSV**：点击"导出CSV"按钮，文件会保存到data目录
- **导出Excel**：点击"导出Excel"按钮

### 4. 配置说明

首次运行会自动生成 `config.json` 配置文件：

```json
{
  "db_enabled": false,
  "db_type": "sqlite",
  "sqlite_db": "data/taobao_spider.db",
  "mysql": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "taobao_spider"
  },
  "browser": {
    "headless": false,
    "disable_images": false
  },
  "proxy": {
    "enabled": false,
    "pool": []
  },
  "user_agents": [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ...
  ]
}
```

#### 数据库配置

- `db_enabled`：设置为true启用数据库存储
- `db_type`：选择数据库类型（sqlite或mysql）
- 使用MySQL时需要先安装pymysql：`py -m pip install pymysql`

#### 浏览器配置

- `browser.headless`：设置为true启用无头模式（不显示浏览器窗口）
- `browser.disable_images`：设置为true禁用图片加载，提升采集速度

#### 代理配置

- `proxy.enabled`：设置为true启用代理
- `proxy.pool`：代理IP列表，格式如 `["http://127.0.0.1:8080", "http://192.168.1.1:8888"]`

## 项目结构

```
pTB/
├── taobao_spider.py    # 主程序入口（GUI界面）
├── spider.py           # 爬虫核心模块（Selenium集成）
├── database.py         # 数据库操作模块
├── config.py           # 配置管理模块
├── config.json         # 配置文件（自动生成）
├── requirements.txt    # 依赖文件
├── README.md           # 说明文档
├── data/               # 数据存储目录
│   ├── cache/          # 图片缓存目录
│   └── taobao_spider.db (SQLite数据库)
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

1. 请确保已安装Chrome浏览器
2. 采集数据请遵守淘宝服务条款和robots.txt规定
3. 合理设置采集间隔，避免对目标网站造成压力
4. 如遇反爬验证，请手动在浏览器中完成验证
5. 使用代理IP可以降低被封风险

## 技术栈

- GUI: tkinter
- 浏览器自动化: Selenium + ChromeDriver
- 图片处理: Pillow
- 数据处理: pandas
- Excel: openpyxl
- 数据库: sqlite3 / pymysql

## 更新日志

### v2.0 (2024-05-03)

- 集成Selenium浏览器自动化
- 添加请求头伪装和随机User-Agent
- 支持代理IP池
- 新增图片预览功能（双击列表项）
- 添加图片下载和缓存
- 优化GUI界面布局
- 更新依赖库
