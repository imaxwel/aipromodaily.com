# Markdown Auto-Translator

自动将 Markdown 博客文章翻译成联合国 6 种官方语言的系统。

## 特性

- 🌍 支持联合国 6 种官方语言（英语、中文、西班牙语、法语、阿拉伯语、俄语）
- 🔄 实时监听文件变化，自动触发翻译
- 📝 保留 Markdown 格式和代码块
- 🤖 支持多种翻译 API（OpenAI、DeepL、Google Translate）
- 🔀 自动 Git 提交和部署
- ⚡ 翻译结果缓存，避免重复翻译

## 安装

```bash
cd scripts/translator
npm install
```

## 配置

### 1. 环境变量

创建 `.env` 文件：

```bash
# 翻译服务提供商 (openai/deepl/google)
TRANSLATOR_PROVIDER=openai

# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key

# DeepL 配置（可选）
DEEPL_API_KEY=your-deepl-api-key

# Google Translate 配置（可选）
GOOGLE_TRANSLATE_API_KEY=your-google-api-key

# 自动推送到远程仓库（可选）
AUTO_PUSH=true
```

### 2. Vercel 部署配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：

- `VERCEL_ORG_ID`: Vercel 组织 ID
- `VERCEL_PROJECT_ID`: Vercel 项目 ID
- `VERCEL_TOKEN`: Vercel 访问令牌
- `NEXT_PUBLIC_SITE_URL`: 网站 URL
- `DATABASE_URL`: 数据库连接字符串
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥

## 使用方法

### 开发模式（使用模拟翻译）

```bash
npm run dev
```

### 生产模式

```bash
npm start
# 或者
node index.js
```

### 作为后台服务运行

使用 PM2：

```bash
npm install -g pm2
pm2 start index.js --name "markdown-translator"
pm2 save
pm2 startup
```

使用 systemd（Linux）：

创建 `/etc/systemd/system/markdown-translator.service`：

```ini
[Unit]
Description=Markdown Auto Translator
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/hope2.do/scripts/translator
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable markdown-translator
sudo systemctl start markdown-translator
```

## 工作流程

1. **创建/修改文章**: 在 `apps/web/content/posts/` 目录下创建或修改 `.md` 或 `.mdx` 文件

2. **自动检测**: 文件监听器检测到变化

3. **语言识别**: 自动识别源语言（中文或英文）

4. **批量翻译**: 自动翻译成其他 5 种语言

5. **文件生成**: 生成对应语言的文件，如：
   - `my-post.md` (英文原文)
   - `my-post.zh.md` (中文)
   - `my-post.es.md` (西班牙语)
   - `my-post.fr.md` (法语)
   - `my-post.ar.md` (阿拉伯语)
   - `my-post.ru.md` (俄语)

6. **Git 提交**: 自动提交到 Git

7. **自动部署**: GitHub Actions 触发，自动部署到 Vercel

## 文件命名规则

- 原始文件: `post-title.md` 或 `post-title.mdx`
- 翻译文件: `post-title.[语言代码].md`
- 草稿文件: `post-title.draft.md` (不会被翻译)

## 注意事项

1. **API 限制**: 注意各翻译 API 的调用限制和费用
2. **翻译质量**: 建议人工校对重要内容
3. **代码块**: 代码块内容不会被翻译
4. **链接**: URL 会被保留，只翻译链接文本
5. **图片**: 图片路径保持不变

## 故障排查

### 翻译失败

- 检查 API 密钥是否正确
- 确认网络连接正常
- 查看日志中的错误信息

### 文件监听不工作

- 确认路径配置正确
- 检查文件权限
- 重启监听服务

### Git 提交失败

- 确认 Git 已配置用户信息
- 检查是否有未提交的更改
- 确认有推送权限

## 扩展功能

### 添加新语言

编辑 `config.js`：

```javascript
languages: {
  'en': 'English',
  'zh': 'Chinese',
  'ja': 'Japanese',  // 添加日语
  // ...
}
```

### 自定义翻译提示词

修改 `translator.js` 中的 `translateWithOpenAI` 方法的 prompt。

### 集成其他翻译服务

在 `translator.js` 中添加新的翻译方法，如 `translateWithCustomAPI`。

## License

MIT
