// 翻译系统配置
module.exports = {
  // 联合国6种官方语言
  languages: {
    'en': 'English',    // 英语
    'zh': 'Chinese',    // 中文
    'es': 'Spanish',    // 西班牙语
    'fr': 'French',     // 法语
    'ar': 'Arabic',     // 阿拉伯语
    'ru': 'Russian'     // 俄语
  },
  
  // 源语言检测配置
  sourceLanguages: ['en', 'zh'], // 支持英文和中文作为源语言
  
  // 文件路径配置
  paths: {
    postsDir: './apps/web/content/posts',
    watchPatterns: ['*.md', '*.mdx'],
    ignorePatterns: ['*.draft.md', '*.draft.mdx']
  },
  
  // 翻译API配置（支持多种服务）
  translator: {
    // 推荐使用 DeepL 或 OpenAI
    provider: process.env.TRANSLATOR_PROVIDER || 'openai', // 'deepl', 'google', 'openai'
    
    // OpenAI 配置
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      maxTokens: 4000
    },
    
    // DeepL 配置
    deepl: {
      apiKey: process.env.DEEPL_API_KEY,
      apiUrl: 'https://api-free.deepl.com/v2/translate'
    },
    
    // Google Translate 配置
    google: {
      apiKey: process.env.GOOGLE_TRANSLATE_API_KEY
    }
  },
  
  // 翻译选项
  translationOptions: {
    preserveFormatting: true,      // 保留 markdown 格式
    translateFrontmatter: true,     // 翻译 frontmatter
    skipCodeBlocks: true,          // 跳过代码块
    preserveLinks: true,           // 保留链接
    cacheTranslations: true,       // 缓存翻译结果
    batchSize: 5,                  // 批量翻译大小
    retryAttempts: 3,              // 重试次数
    retryDelay: 1000              // 重试延迟(ms)
  },
  
  // Git 配置
  git: {
    autoCommit: true,
    commitMessage: 'Auto-translate: Add {lang} translation for {file}',
    branch: 'main'
  },
  
  // 监听器配置
  watcher: {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    },
    depth: 2
  }
};
