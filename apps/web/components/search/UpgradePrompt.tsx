import { Crown, Star, Zap, X } from 'lucide-react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export function UpgradePrompt({ isOpen, onClose, currentPlan }: UpgradePromptProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'monthly',
      title: '包月会员',
      price: '¥29/月',
      icon: Zap,
      features: [
        '搜索所有博文',
        '阅读完整内容',
        '下载资源文件',
        '评论互动'
      ],
      color: 'blue'
    },
    {
      name: 'yearly',
      title: '包年会员',
      price: '¥299/年',
      icon: Crown,
      features: [
        '包月会员所有权益',
        '独家内容访问',
        '优先技术支持',
        '年度会员礼包'
      ],
      color: 'yellow',
      popular: true
    },
    {
      name: 'lifetime',
      title: '终身会员',
      price: '¥999',
      icon: Star,
      features: [
        '所有会员权益',
        '永久访问权限',
        '未来内容免费',
        'VIP专属徽章'
      ],
      color: 'purple'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-xl 
                      shadow-2xl w-full max-w-4xl mx-auto p-6">
          
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                升级会员，解锁更多内容
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                当前方案: {currentPlan === 'free' ? '免费用户' : currentPlan}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* 价格卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.name === currentPlan;
              
              return (
                <div
                  key={plan.name}
                  className={`
                    relative rounded-lg border-2 p-6
                    ${plan.popular 
                      ? 'border-yellow-500 dark:border-yellow-400' 
                      : 'border-gray-200 dark:border-gray-700'
                    }
                    ${isCurrentPlan ? 'bg-gray-50 dark:bg-gray-800' : ''}
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs 
                                     font-semibold rounded-full">
                        最受欢迎
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <Icon className={`
                      w-12 h-12 mx-auto mb-3
                      ${plan.color === 'blue' ? 'text-blue-500' : ''}
                      ${plan.color === 'yellow' ? 'text-yellow-500' : ''}
                      ${plan.color === 'purple' ? 'text-purple-500' : ''}
                    `} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {plan.title}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {plan.price}
                      </span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    disabled={isCurrentPlan}
                    className={`
                      w-full py-2 px-4 rounded-lg font-medium transition-colors
                      ${isCurrentPlan
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }
                    `}
                  >
                    {isCurrentPlan ? '当前方案' : '立即升级'}
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* 底部说明 */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>所有方案均支持7天无理由退款</p>
            <p className="mt-1">有问题？<a href="#" className="text-blue-600 hover:underline">联系客服</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}