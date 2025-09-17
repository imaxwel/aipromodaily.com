const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const config = require('./config');

class FileWatcher {
  constructor(translator) {
    this.translator = translator;
    this.watcher = null;
    this.processingQueue = new Set();
  }

  /**
   * 启动文件监听器
   */
  start() {
    const watchPath = path.resolve(config.paths.postsDir);
    console.log(`🔍 Starting file watcher on: ${watchPath}`);
    
    this.watcher = chokidar.watch(config.paths.watchPatterns, {
      cwd: watchPath,
      ignored: config.paths.ignorePatterns,
      ...config.watcher
    });

    // 监听文件添加事件
    this.watcher.on('add', (filePath) => this.handleFileChange(filePath, 'added'));
    
    // 监听文件修改事件
    this.watcher.on('change', (filePath) => this.handleFileChange(filePath, 'modified'));
    
    // 监听错误
    this.watcher.on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

    console.log('✅ File watcher started successfully');
  }

  /**
   * 处理文件变更
   */
  async handleFileChange(filePath, changeType) {
    const fullPath = path.resolve(config.paths.postsDir, filePath);
    
    // 检查是否是翻译后的文件（避免循环）
    if (this.isTranslatedFile(filePath)) {
      console.log(`⏭️  Skipping translated file: ${filePath}`);
      return;
    }

    // 避免重复处理
    if (this.processingQueue.has(fullPath)) {
      console.log(`⏭️  Already processing: ${filePath}`);
      return;
    }

    console.log(`\n📝 File ${changeType}: ${filePath}`);
    this.processingQueue.add(fullPath);

    try {
      // 读取文件内容
      const content = await fs.readFile(fullPath, 'utf-8');
      
      // 检测源语言
      const sourceLanguage = await this.detectLanguage(content);
      console.log(`🔤 Detected language: ${sourceLanguage}`);
      
      // 获取需要翻译的目标语言
      const targetLanguages = this.getTargetLanguages(sourceLanguage);
      console.log(`🎯 Target languages: ${targetLanguages.join(', ')}`);
      
      // 执行翻译
      for (const targetLang of targetLanguages) {
        await this.translateFile(fullPath, content, sourceLanguage, targetLang);
      }
      
      console.log(`✅ Translation completed for: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
    } finally {
      this.processingQueue.delete(fullPath);
    }
  }

  /**
   * 检测文件是否是翻译后的文件
   */
  isTranslatedFile(filePath) {
    const supportedLangs = Object.keys(config.languages);
    const pattern = new RegExp(`\\.(${supportedLangs.join('|')})\\.(md|mdx)$`);
    return pattern.test(filePath);
  }

  /**
   * 检测内容的语言
   */
  async detectLanguage(content) {
    // 从 frontmatter 中检测语言
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const langMatch = frontmatterMatch[1].match(/language:\s*(.+)/);
      if (langMatch) {
        return langMatch[1].trim();
      }
    }

    // 简单的语言检测（基于字符）
    const chineseChars = content.match(/[\u4e00-\u9fa5]/g);
    if (chineseChars && chineseChars.length > content.length * 0.1) {
      return 'zh';
    }
    
    return 'en'; // 默认英语
  }

  /**
   * 获取需要翻译的目标语言
   */
  getTargetLanguages(sourceLanguage) {
    return Object.keys(config.languages).filter(lang => lang !== sourceLanguage);
  }

  /**
   * 翻译文件
   */
  async translateFile(filePath, content, sourceLang, targetLang) {
    try {
      console.log(`  🔄 Translating to ${targetLang}...`);
      
      // 调用翻译服务
      const translatedContent = await this.translator.translate(
        content,
        sourceLang,
        targetLang
      );
      
      // 生成翻译后的文件名
      const parsedPath = path.parse(filePath);
      const translatedFileName = `${parsedPath.name}.${targetLang}${parsedPath.ext}`;
      const translatedFilePath = path.join(parsedPath.dir, translatedFileName);
      
      // 保存翻译后的文件
      await fs.writeFile(translatedFilePath, translatedContent, 'utf-8');
      console.log(`  ✅ Saved: ${translatedFileName}`);
      
    } catch (error) {
      console.error(`  ❌ Failed to translate to ${targetLang}:`, error.message);
    }
  }

  /**
   * 停止监听器
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log('🛑 File watcher stopped');
    }
  }
}

module.exports = FileWatcher;
