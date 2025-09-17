#!/usr/bin/env node

const FileWatcher = require('./watcher');
const Translator = require('./translator');
const config = require('./config');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log(`
╔════════════════════════════════════════╗
║   🌍 Markdown Auto-Translator v1.0     ║
║   UN 6 Languages Support               ║
╚════════════════════════════════════════╝
`);

// 显示配置信息
console.log('📋 Configuration:');
console.log(`  • Languages: ${Object.keys(config.languages).join(', ')}`);
console.log(`  • Provider: ${config.translator.provider}`);
console.log(`  • Watch directory: ${config.paths.postsDir}`);
console.log(`  • Auto-commit: ${config.git.autoCommit ? 'Yes' : 'No'}`);
console.log('');

// 创建翻译器和监听器实例
const translator = new Translator();
const watcher = new FileWatcher(translator);

// Git 自动提交功能
async function gitAutoCommit(files) {
  if (!config.git.autoCommit) {
    return;
  }

  try {
    console.log('📦 Auto-committing changes to Git...');
    
    // 添加文件到 Git
    for (const file of files) {
      await execPromise(`git add ${file}`);
    }
    
    // 创建提交信息
    const commitMessage = config.git.commitMessage
      .replace('{lang}', 'multiple languages')
      .replace('{file}', `${files.length} files`);
    
    // 提交更改
    await execPromise(`git commit -m "${commitMessage}"`);
    console.log('✅ Changes committed to Git');
    
    // 可选：自动推送
    if (process.env.AUTO_PUSH === 'true') {
      await execPromise(`git push origin ${config.git.branch}`);
      console.log('✅ Changes pushed to remote repository');
    }
  } catch (error) {
    console.error('❌ Git operation failed:', error.message);
  }
}

// 修改 watcher 的 handleFileChange 方法以支持批量 Git 提交
const originalHandleFileChange = watcher.handleFileChange.bind(watcher);
const translatedFiles = [];

watcher.handleFileChange = async function(filePath, changeType) {
  await originalHandleFileChange(filePath, changeType);
  
  // 收集翻译后的文件
  if (translatedFiles.length > 0) {
    await gitAutoCommit(translatedFiles);
    translatedFiles.length = 0; // 清空数组
  }
};

// 启动监听器
watcher.start();

// 优雅退出处理
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  watcher.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  watcher.stop();
  process.exit(0);
});

// 保持进程运行
console.log('\n✨ Auto-translator is running. Press Ctrl+C to stop.\n');
