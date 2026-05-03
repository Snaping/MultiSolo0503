const readline = require('readline');
const chalk = require('chalk').default || require('chalk');
const ChatBot = require('./bot');

class CLI {
  constructor() {
    this.bot = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green ? chalk.green('You: ') : 'You: '
    });
  }

  async start() {
    console.log(chalk.blue?.bold ? chalk.blue.bold('========================================') : '========================================');
    console.log(chalk.blue?.bold ? chalk.blue.bold('           AI Chat Bot v1.0') : '           AI Chat Bot v1.0');
    console.log(chalk.blue?.bold ? chalk.blue.bold('========================================') : '========================================');
    console.log(chalk.yellow ? chalk.yellow('欢迎使用AI聊天机器人！') : '欢迎使用AI聊天机器人！');
    console.log(chalk.yellow ? chalk.yellow('输入 "quit" 或 "exit" 退出程序') : '输入 "quit" 或 "exit" 退出程序');
    console.log(chalk.yellow ? chalk.yellow('输入 "clear" 清除聊天历史') : '输入 "clear" 清除聊天历史');
    console.log(chalk.yellow ? chalk.yellow('输入 "profile" 查看用户信息') : '输入 "profile" 查看用户信息');
    console.log(chalk.blue?.bold ? chalk.blue.bold('========================================\n') : '========================================\n');
    
    this.bot = new ChatBot();
    await this.bot.initialize();
    
    this.rl.prompt();
    
    this.rl.on('line', async (input) => {
      input = input.trim();
      
      if (!input) {
        this.rl.prompt();
        return;
      }
      
      switch (input.toLowerCase()) {
        case 'quit':
        case 'exit':
          this.rl.close();
          break;
        case 'clear':
          await this.bot.clearHistory();
          console.log(chalk.yellow ? chalk.yellow('聊天历史已清除') : '聊天历史已清除');
          this.rl.prompt();
          break;
        case 'profile':
          await this.showProfile();
          this.rl.prompt();
          break;
        default:
          await this.handleUserInput(input);
          this.rl.prompt();
          break;
      }
    }).on('close', () => {
      console.log(chalk.blue ? chalk.blue('\n感谢使用AI聊天机器人，再见！') : '\n感谢使用AI聊天机器人，再见！');
      process.exit(0);
    });
  }

  async handleUserInput(input) {
    try {
      console.log(chalk.gray ? chalk.gray('正在思考...') : '正在思考...');
      const response = await this.bot.getResponse(input);
      console.log((chalk.cyan?.bold ? chalk.cyan.bold('Bot: ') : 'Bot: ') + (chalk.white ? chalk.white(response) : response));
    } catch (error) {
      console.error((chalk.red ? chalk.red('Error: ') : 'Error: ') + error.message);
    }
  }

  async showProfile() {
    const profile = await this.bot.storage.loadUserProfile();
    console.log(chalk.blue?.bold ? chalk.blue.bold('\n用户信息:') : '\n用户信息:');
    console.log('-------------------');
    console.log((chalk.yellow ? chalk.yellow('名字:') : '名字:'), profile.name || '未设置');
    console.log((chalk.yellow ? chalk.yellow('职业:') : '职业:'), profile.preferences?.occupation || '未设置');
    console.log((chalk.yellow ? chalk.yellow('所在地:') : '所在地:'), profile.preferences?.location || '未设置');
    console.log((chalk.yellow ? chalk.yellow('兴趣爱好:') : '兴趣爱好:'), profile.preferences?.interests || '未设置');
    console.log((chalk.yellow ? chalk.yellow('不喜欢的事物:') : '不喜欢的事物:'), profile.preferences?.dislikes || '未设置');
    console.log((chalk.yellow ? chalk.yellow('对话历史记录:') : '对话历史记录:'), profile.conversationHistory?.length || 0, '条');
    console.log('-------------------\n');
  }
}

module.exports = CLI;