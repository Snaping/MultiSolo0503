# AI聊天机器人 - DeepSeek版本

基于LangChain和DeepSeek API的命令行聊天机器人，支持根据日常聊天不断进化。

## 功能特性

- 🌊 **基于DeepSeek AI** - 智能对话能力
- 💾 **对话历史记忆** - 持久化存储聊天记录
- 👤 **用户信息学习** - 自动学习并记住用户信息
- 🎮 **命令行交互** - 简洁的命令行界面
- 📝 **丰富命令** - 支持查看个人信息、清除历史等

## 安装依赖

```bash
npm install
```

## 配置API

1. 注册DeepSeek账号并获取API Key：https://platform.deepseek.com/

2. 编辑 `.env` 文件，填入你的API Key：

```env
# DeepSeek API配置
DEEPSEEK_API_KEY=sk-xxx-your-api-key-here
DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1

# 模型配置
MODEL_NAME=deepseek-chat
TEMPERATURE=0.7
```

## 支持的模型

- `deepseek-chat` - DeepSeek通用模型（推荐）
- `deepseek-reasoner` - DeepSeek推理模型

## 运行机器人

```bash
node index.js
```

## 使用命令

- **普通对话**：直接输入任意文本进行聊天
- `quit` / `exit`：退出程序
- `clear`：清除聊天历史
- `profile`：查看已学习的用户信息

## 学习的用户信息

机器人会自动从对话中学习以下信息：

- 姓名（通过"我叫"、"我的名字是"等关键词）
- 职业（通过"职业"、"工作"等关键词）
- 所在地（通过"来自"、"住在"等关键词）
- 兴趣爱好（通过"喜欢"、"爱好"、"兴趣"等关键词）
- 不喜欢的事物（通过"讨厌"、"不喜欢"等关键词）

## 项目结构

```
CmdBot/
├── index.js          # 主入口文件
├── src/
│   ├── bot.js        # 聊天机器人核心逻辑
│   ├── cli.js        # 命令行交互界面
│   └── storage.js    # 数据存储模块
├── .env              # 环境配置文件
├── package.json      # 项目依赖配置
└── data/             # 数据存储目录（自动创建）
```

## 使用示例

```
========================================
           AI Chat Bot v1.0
========================================
欢迎使用AI聊天机器人！
输入 "quit" 或 "exit" 退出程序
输入 "clear" 清除聊天历史
输入 "profile" 查看用户信息
========================================

You: 你好
正在思考...
Bot: 你好！很高兴认识你！有什么我可以帮助你的吗？

You: 我叫李明，我是一名程序员，喜欢编程
正在思考...
Bot: 你好李明！很高兴认识你，作为程序员，编程一定是你很擅长的事情吧！

You: profile

用户信息:
-------------------
名字: 李明
职业: 程序员
所在地: 未设置
兴趣爱好: 编程
不喜欢的事物: 未设置
对话历史记录: 2条
-------------------

You: quit

感谢使用AI聊天机器人，再见！
```

## 注意事项

- API Key请妥善保管，不要提交到代码仓库
- 首次使用会自动创建data目录存储对话记录
- 对话历史最多保存100条，超出后自动删除最早的记录

## 技术栈

- Node.js
- LangChain
- DeepSeek API
- fs-extra (文件操作)
- dotenv (环境变量管理)
