const config = require('./config');
const matter = require('gray-matter');

class Translator {
  constructor() {
    this.provider = config.translator.provider;
    this.cache = new Map();
  }

  /**
   * 翻译 Markdown 内容
   */
  async translate(content, sourceLang, targetLang) {
    // 解析 markdown frontmatter 和内容
    const { data: frontmatter, content: markdownContent } = matter(content);
    
    // 分别翻译 frontmatter 和内容
    const translatedFrontmatter = await this.translateFrontmatter(frontmatter, sourceLang, targetLang);
    const translatedContent = await this.translateMarkdown(markdownContent, sourceLang, targetLang);
    
    // 重新组合
    return this.reconstructMarkdown(translatedFrontmatter, translatedContent);
  }

  /**
   * 翻译 Frontmatter
   */
  async translateFrontmatter(frontmatter, sourceLang, targetLang) {
    const translated = { ...frontmatter };
    
    // 需要翻译的字段
    const fieldsToTranslate = ['title', 'excerpt', 'description'];
    
    for (const field of fieldsToTranslate) {
      if (translated[field]) {
        translated[field] = await this.translateText(translated[field], sourceLang, targetLang);
      }
    }
    
    // 添加语言标记
    translated.locale = targetLang;
    translated.translatedFrom = sourceLang;
    translated.translatedAt = new Date().toISOString();
    
    return translated;
  }

  /**
   * 翻译 Markdown 内容
   */
  async translateMarkdown(content, sourceLang, targetLang) {
    // 保护代码块和特殊标记
    const { protectedContent, placeholders } = this.protectSpecialContent(content);
    
    // 分段翻译（按段落）
    const paragraphs = protectedContent.split('\n\n');
    const translatedParagraphs = [];
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        const translated = await this.translateText(paragraph, sourceLang, targetLang);
        translatedParagraphs.push(translated);
      } else {
        translatedParagraphs.push(paragraph);
      }
    }
    
    // 重新组合并恢复特殊内容
    const translatedContent = translatedParagraphs.join('\n\n');
    return this.restoreSpecialContent(translatedContent, placeholders);
  }

  /**
   * 保护特殊内容（代码块、链接等）
   */
  protectSpecialContent(content) {
    const placeholders = new Map();
    let placeholderIndex = 0;
    let protectedContent = content;
    
    // 保护代码块
    protectedContent = protectedContent.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODEBLOCK_${placeholderIndex}__`;
      placeholders.set(placeholder, match);
      placeholderIndex++;
      return placeholder;
    });
    
    // 保护行内代码
    protectedContent = protectedContent.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__INLINECODE_${placeholderIndex}__`;
      placeholders.set(placeholder, match);
      placeholderIndex++;
      return placeholder;
    });
    
    // 保护链接
    protectedContent = protectedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const placeholder = `__LINK_${placeholderIndex}__`;
      placeholders.set(placeholder, { text, url, original: match });
      placeholderIndex++;
      return placeholder;
    });
    
    return { protectedContent, placeholders };
  }

  /**
   * 恢复特殊内容
   */
  restoreSpecialContent(content, placeholders) {
    let restoredContent = content;
    
    for (const [placeholder, value] of placeholders) {
      if (placeholder.startsWith('__LINK_')) {
        // 对链接文本进行翻译，但保留URL
        restoredContent = restoredContent.replace(placeholder, `[${value.text}](${value.url})`);
      } else {
        restoredContent = restoredContent.replace(placeholder, value);
      }
    }
    
    return restoredContent;
  }

  /**
   * 调用具体的翻译API
   */
  async translateText(text, sourceLang, targetLang) {
    // 检查缓存
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    let translatedText;
    
    switch (this.provider) {
      case 'openai':
        translatedText = await this.translateWithOpenAI(text, sourceLang, targetLang);
        break;
      case 'deepl':
        translatedText = await this.translateWithDeepL(text, sourceLang, targetLang);
        break;
      case 'google':
        translatedText = await this.translateWithGoogle(text, sourceLang, targetLang);
        break;
      default:
        // 模拟翻译（用于测试）
        translatedText = await this.mockTranslate(text, sourceLang, targetLang);
    }
    
    // 缓存结果
    this.cache.set(cacheKey, translatedText);
    return translatedText;
  }

  /**
   * OpenAI 翻译
   */
  async translateWithOpenAI(text, sourceLang, targetLang) {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({
      apiKey: config.translator.openai.apiKey,
    });

    const languageNames = {
      'en': 'English',
      'zh': 'Chinese',
      'es': 'Spanish',
      'fr': 'French',
      'ar': 'Arabic',
      'ru': 'Russian'
    };

    const prompt = `Translate the following text from ${languageNames[sourceLang]} to ${languageNames[targetLang]}. 
    Maintain the original formatting, tone, and style. 
    For technical terms, keep them accurate and professional.
    
    Text to translate:
    ${text}`;

    try {
      const response = await openai.chat.completions.create({
        model: config.translator.openai.model,
        messages: [
          { role: 'system', content: 'You are a professional translator. Translate accurately while preserving markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: config.translator.openai.temperature,
        max_tokens: config.translator.openai.maxTokens,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI translation error:', error);
      throw error;
    }
  }

  /**
   * DeepL 翻译
   */
  async translateWithDeepL(text, sourceLang, targetLang) {
    const axios = require('axios');
    
    // DeepL 语言代码映射
    const langMap = {
      'zh': 'ZH',
      'en': 'EN',
      'es': 'ES',
      'fr': 'FR',
      'ru': 'RU',
      'ar': 'AR' // 注意：DeepL 可能不支持阿拉伯语
    };

    try {
      const response = await axios.post(config.translator.deepl.apiUrl, null, {
        params: {
          auth_key: config.translator.deepl.apiKey,
          text: text,
          source_lang: langMap[sourceLang],
          target_lang: langMap[targetLang],
          preserve_formatting: 1
        }
      });

      return response.data.translations[0].text;
    } catch (error) {
      console.error('DeepL translation error:', error);
      throw error;
    }
  }

  /**
   * Google Translate 翻译
   */
  async translateWithGoogle(text, sourceLang, targetLang) {
    const { Translate } = require('@google-cloud/translate').v2;
    const translate = new Translate({
      key: config.translator.google.apiKey
    });

    try {
      const [translation] = await translate.translate(text, {
        from: sourceLang,
        to: targetLang
      });
      return translation;
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }

  /**
   * 模拟翻译（用于测试）
   */
  async mockTranslate(text, sourceLang, targetLang) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 简单的模拟翻译标记
    return `[${targetLang.toUpperCase()}] ${text}`;
  }

  /**
   * 重新构建 Markdown 文件
   */
  reconstructMarkdown(frontmatter, content) {
    const yaml = require('js-yaml');
    const frontmatterYaml = yaml.dump(frontmatter);
    
    return `---
${frontmatterYaml.trim()}
---

${content}`;
  }
}

module.exports = Translator;
