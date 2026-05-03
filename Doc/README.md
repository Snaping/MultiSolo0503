# 代码文档生成器

一个桌面工具，用于自动分析Git仓库代码结构并生成完整的项目文档。

## 功能特性

- **Git仓库管理**: 支持克隆和拉取远程Git仓库
- **代码结构分析**: 自动分析项目的目录结构、模块、类和函数
- **技术栈检测**: 自动识别项目使用的技术栈
- **文档生成**: 生成包含以下内容的Markdown文档：
  - 项目概述
  - 技术栈说明
  - 组织架构（目录结构）
  - 模块功能说明
  - 类说明
  - 模块交互关系
- **UML图表生成**: 生成PlantUML格式的用例图、类图、活动图

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行程序

```bash
python main.py
```

## 使用说明

1. **配置Git仓库**
   - 输入Git仓库URL
   - 选择本地保存路径

2. **克隆/拉取仓库**
   - 点击"克隆/拉取仓库"按钮
   - 如果路径已有仓库，会自动拉取最新代码

3. **分析代码结构**
   - 点击"分析代码结构"按钮
   - 程序会扫描所有代码文件，提取模块、类、函数等信息

4. **生成文档**
   - 点击"生成文档"按钮
   - 文档会保存为 `PROJECT_DOCUMENTATION.md`
   - UML图表会保存在 `diagrams/` 目录下

## 项目结构

```
Doc/
├── main.py              # 主程序入口和GUI界面
├── git_operations.py    # Git仓库操作模块
├── code_analyzer.py     # 代码结构分析模块
├── doc_generator.py     # 文档生成模块
├── requirements.txt     # 依赖包列表
└── README.md            # 项目说明
```

## 支持的语言

- Python (.py)
- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Java (.java)
- 以及其他常见文件类型

## 注意事项

- 需要安装Git命令行工具
- 分析大型项目可能需要较长时间
- UML图表为PlantUML格式，可使用PlantUML工具渲染为图片
