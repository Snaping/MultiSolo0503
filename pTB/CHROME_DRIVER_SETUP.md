# ChromeDriver 下载说明

由于网络限制，无法自动下载 ChromeDriver。请手动完成以下步骤：

## 步骤 1: 确认 Chrome 版本

1. 打开 Chrome 浏览器
2. 地址栏输入: `chrome://settings/help`
3. 记下版本号（如 120.0.6099.130）

## 步骤 2: 下载 ChromeDriver

1. 访问: https://chromedriver.chromium.org/downloads
2. 选择与你的 Chrome 版本匹配的 ChromeDriver
3. 下载 Windows 版本（win32.zip）

## 步骤 3: 解压并放置

1. 解压下载的 zip 文件
2. 将 `chromedriver.exe` 复制到本项目的 `drivers` 目录
3. 最终路径应为: `d:\WorkSpace\Agent\MultiSoloSpace\MultiSolo0503\pTB\drivers\chromedriver.exe`

## 步骤 4: 更新配置文件

编辑 `config.json`，添加 chromedriver_path:

```json
{
  "browser": {
    "type": "chrome",
    "headless": false
  },
  "chromedriver_path": "d:\\WorkSpace\\Agent\\MultiSoloSpace\\MultiSolo0503\\pTB\\drivers\\chromedriver.exe"
}
```

## 步骤 5: 运行程序

```bash
py taobao_spider.py
```
