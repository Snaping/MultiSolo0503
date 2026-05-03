const fs = require('fs-extra');
const path = require('path');

class ChatStorage {
  constructor() {
    this.storageDir = path.join(__dirname, '..', 'data');
    this.chatFile = path.join(this.storageDir, 'chat_history.json');
    this.userProfileFile = path.join(this.storageDir, 'user_profile.json');
  }

  async init() {
    await fs.ensureDir(this.storageDir);
    if (!await fs.pathExists(this.chatFile)) {
      await fs.writeJson(this.chatFile, []);
    }
    if (!await fs.pathExists(this.userProfileFile)) {
      await fs.writeJson(this.userProfileFile, {
        name: null,
        preferences: {},
        conversationHistory: []
      });
    }
  }

  async saveChatHistory(messages) {
    await fs.writeJson(this.chatFile, messages, { spaces: 2 });
  }

  async loadChatHistory() {
    return await fs.readJson(this.chatFile);
  }

  async saveUserProfile(profile) {
    const existing = await this.loadUserProfile();
    const updated = { ...existing, ...profile };
    await fs.writeJson(this.userProfileFile, updated, { spaces: 2 });
    return updated;
  }

  async loadUserProfile() {
    return await fs.readJson(this.userProfileFile);
  }

  async updateUserProfileFromMessage(message) {
    const profile = await this.loadUserProfile();
    
    const keywords = [
      { regex: /(我叫|我的名字是|我是)\s*(\S+)/, field: 'name' },
      { regex: /(喜欢|爱好|兴趣)\s*[:：]?\s*(\S+)/, field: 'preferences.interests' },
      { regex: /(讨厌|不喜欢)\s*[:：]?\s*(\S+)/, field: 'preferences.dislikes' },
      { regex: /(职业|工作)\s*[:：]?\s*(\S+)/, field: 'preferences.occupation' },
      { regex: /(来自|住在)\s*[:：]?\s*(\S+)/, field: 'preferences.location' },
    ];

    for (const keyword of keywords) {
      const match = message.match(keyword.regex);
      if (match && match[2]) {
        const value = match[2].trim();
        const fields = keyword.field.split('.');
        let obj = profile;
        for (let i = 0; i < fields.length - 1; i++) {
          if (!obj[fields[i]]) obj[fields[i]] = {};
          obj = obj[fields[i]];
        }
        obj[fields[fields.length - 1]] = value;
      }
    }

    profile.conversationHistory.push({
      timestamp: Date.now(),
      message: message.substring(0, 100)
    });

    if (profile.conversationHistory.length > 50) {
      profile.conversationHistory = profile.conversationHistory.slice(-50);
    }

    await this.saveUserProfile(profile);
    return profile;
  }
}

module.exports = ChatStorage;