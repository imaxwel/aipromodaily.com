'use client';

import { BlogSearch } from './BlogSearch';

export function SearchDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            博客搜索演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            测试带权限控制的搜索功能
          </p>
          
          {/* 搜索组件 */}
          <div className="flex justify-center mb-12">
            <BlogSearch />
          </div>
          
          {/* 功能说明 */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                游客权限
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>❌ 无法使用搜索</li>
                <li>👀 可预览公开文章</li>
                <li>🔒 需要登录提示</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                注册用户
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✅ 搜索公开内容</li>
                <li>📖 阅读注册用户内容</li>
                <li>⭐ 收藏文章功能</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                付费会员
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>🔍 搜索所有内容</li>
                <li>💎 访问独家文章</li>
                <li>⚡ 优先支持服务</li>
              </ul>
            </div>
          </div>
          
          {/* 测试说明 */}
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              测试说明
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              使用 <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">Cmd/Ctrl + K</kbd> 快速打开搜索框
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
              当前为演示模式，搜索API返回模拟数据
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}