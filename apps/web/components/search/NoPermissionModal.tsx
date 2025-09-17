import { X } from 'lucide-react';

interface NoPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function NoPermissionModal({ isOpen, onClose, onLogin }: NoPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-xl 
                      shadow-2xl w-full max-w-md mx-auto p-6">
          
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              需要登录
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* 内容 */}
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              搜索功能需要登录后才能使用。登录后您可以：
            </p>
            
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>搜索所有公开文章</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>保存搜索历史</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>获得个性化推荐</span>
              </li>
            </ul>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={onLogin}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 transition-colors"
              >
                立即登录
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 
                         rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 
                         transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}