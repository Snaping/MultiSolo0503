require('dotenv').config();
const { ChatOpenAI } = require('@langchain/openai');
const ChatStorage = require('./storage');

class ChatBot {
  constructor() {
    this.model = new ChatOpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
      modelName: process.env.MODEL_NAME || 'deepseek-chat',
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
      configuration: {
        baseURL: process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1'
      }
    });
    this.storage = new ChatStorage();
    this.chatHistory = [];
    this.userProfile = null;
    this.initialize();
  }

  async initialize() {
    await this.storage.init();
    this.userProfile = await this.storage.loadUserProfile();
    const history = await this.storage.loadChatHistory();
    this.chatHistory = history;
  }

  async getResponse(userInput) {
    await this.storage.updateUserProfileFromMessage(userInput);
    this.userProfile = await this.storage.loadUserProfile();
    
    const profileContext = this.buildProfileContext();
    
    const messages = [
      {
        role: 'system',
        content: `你是一个友好、聪明的聊天机器人，能够根据日常聊天不断进化。

用户信息：
${profileContext}

请根据以上信息，用自然、友好的方式回应用户的问题。
如果用户提供了新的个人信息，请记住它以便后续对话使用。
保持回答简洁自然。`
      },
      ...this.chatHistory.slice(-20).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userInput
      }
    ];

    const response = await this.model.invoke(messages);
    
    await this.saveMessage('user', userInput);
    await this.saveMessage('assistant', response.content);
    
    return response.content;
  }

  buildProfileContext() {
    if (!this.userProfile) return '暂无用户信息';
    
    let context = [];
    if (this.userProfile.name) {
      context.push(`名字：${this.userProfile.name}`);
    }
    if (this.userProfile.preferences) {
      if (this.userProfile.preferences.interests) {
        context.push(`兴趣爱好：${this.userProfile.preferences.interests}`);
      }
      if (this.userProfile.preferences.dislikes) {
        context.push(`不喜欢的事物：${this.userProfile.preferences.dislikes}`);
      }
      if (this.userProfile.preferences.occupation) {
        context.push(`职业：${this.userProfile.preferences.occupation}`);
      }
      if (this.userProfile.preferences.location) {
        context.push(`所在地：${this.userProfile.preferences.location}`);
      }
    }
    if (this.userProfile.conversationHistory && this.userProfile.conversationHistory.length > 0) {
      context.push(`最近对话次数：${this.userProfile.conversationHistory.length}次`);
    }
    
    return context.length > 0 ? context.join('\n') : '暂无详细信息';
  }

  async saveMessage(role, content) {
    const message = {
      role: role,
      content: content,
      timestamp: Date.now()
    };
    
    this.chatHistory.push(message);
    
    if (this.chatHistory.length > 100) {
      this.chatHistory.shift();
    }
    
    await this.storage.saveChatHistory(this.chatHistory);
  }

  async clearHistory() {
    this.chatHistory = [];
    await this.storage.saveChatHistory([]);
  }
}

module.exports = ChatBot;