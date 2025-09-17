#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 构建搜索索引
 */
async function buildSearchIndex() {
  console.log('🔍 开始构建搜索索引...');
  
  const projectRoot = path.join(__dirname, '..');
  
  try {
    // 检查是否有构建输出目录
    const buildPath = path.join(projectRoot, '.next');
    if (!fs.existsSync(buildPath)) {
      console.error('❌ 未找到.next目录，请先运行 npm run build');
      process.exit(1);
    }
    
    // 确保public目录存在
    const publicPath = path.join(projectRoot, 'public');
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    // 运行Pagefind索引
    console.log('📦 生成Pagefind索引...');
    
    // 使用配置文件运行Pagefind
    const configFile = path.join(projectRoot, 'pagefind.yml');
    if (fs.existsSync(configFile)) {
      execSync('npx pagefind --config pagefind.yml', {
        stdio: 'inherit',
        cwd: projectRoot
      });
    } else {
      // 直接运行，使用默认参数
      execSync('npx pagefind --site .next --output-path public/pagefind', {
        stdio: 'inherit',
        cwd: projectRoot
      });
    }
    
    // 检查输出
    const pagefindPath = path.join(publicPath, 'pagefind');
    if (fs.existsSync(pagefindPath)) {
      const files = fs.readdirSync(pagefindPath);
      console.log(`✅ 搜索索引构建成功！生成了 ${files.length} 个文件`);
      
      // 显示一些统计信息
      const jsFiles = files.filter(f => f.endsWith('.js'));
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      const pagesFile = files.find(f => f.includes('pagefind-entry'));
      
      console.log(`   - JavaScript文件: ${jsFiles.length}`);
      console.log(`   - JSON索引文件: ${jsonFiles.length}`);
      
      if (pagesFile) {
        const size = fs.statSync(path.join(pagefindPath, pagesFile)).size;
        console.log(`   - 入口文件大小: ${(size / 1024).toFixed(2)} KB`);
      }
    } else {
      console.error('❌ Pagefind索引生成失败');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 构建搜索索引时出错:', error.message);
    process.exit(1);
  }
}

// 执行构建
buildSearchIndex().catch(console.error);