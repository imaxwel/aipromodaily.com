# Cookie 合规最佳实践指南

## 概述
Cookie 横幅是网站合规的重要组成部分，不同地区有不同的法律要求。本文档提供全面的实施指南。

## 各地区法律要求对比

### 🇪🇺 欧洲 (GDPR + ePrivacy Directive)
**最严格的要求**
- **明确同意原则**：用户必须主动同意才能设置非必要 Cookie
- **默认状态**：所有非必要 Cookie 默认关闭
- **粒度控制**：必须提供分类选择（功能性、分析、营销等）
- **撤回机制**：随时可撤回同意
- **罚款**：最高年营业额 4% 或 2000 万欧元

### 🇺🇸 美国
**州级法律差异**
- **加州 (CCPA/CPRA)**：
  - 要求"Do Not Sell My Personal Information"链接
  - 允许选择退出（opt-out）模式
  - 罚款：每次违规 $2,500-$7,500
  
- **其他州**：
  - 科罗拉多、弗吉尼亚、康涅狄格等州有类似要求
  - 一般采用通知即可的方式

### 🌏 亚洲
**各国要求差异较大**
- **中国**：
  - 《个人信息保护法》要求明确同意
  - 需要中文说明
  - 敏感信息需单独同意
  
- **日本**：
  - 相对宽松，通知即可
  - 重点在透明度
  
- **新加坡**：
  - PDPA 要求合理通知
  - 可采用 opt-out 模式

- **韩国**：
  - PIPA 要求明确同意
  - 类似欧洲标准

## 推荐的最佳实践实施方案

### 1. Cookie 分类系统
```javascript
const cookieCategories = {
  necessary: {
    name: "必要性 Cookie",
    description: "网站正常运行所必需，不可关闭",
    enabled: true,
    locked: true
  },
  functional: {
    name: "功能性 Cookie", 
    description: "记住用户偏好设置，如语言、主题等",
    enabled: false,
    locked: false
  },
  analytics: {
    name: "分析型 Cookie",
    description: "帮助我们了解网站使用情况",
    enabled: false,
    locked: false
  },
  marketing: {
    name: "营销型 Cookie",
    description: "用于个性化广告和再营销",
    enabled: false,
    locked: false
  }
};
```

### 2. 横幅设计规范

#### 基础版（适用于低风险网站）
```html
<div class="cookie-banner">
  <div class="cookie-content">
    <h3>我们使用 Cookie</h3>
    <p>本网站使用 Cookie 来提升您的浏览体验。继续使用即表示您同意我们的 Cookie 政策。</p>
    <div class="cookie-actions">
      <button class="decline">拒绝非必要</button>
      <button class="accept-all">接受全部</button>
    </div>
    <a href="/privacy-policy">了解更多</a>
  </div>
</div>
```

#### 高级版（推荐，满足 GDPR）
```html
<div class="cookie-banner" role="dialog" aria-label="Cookie 同意管理">
  <div class="cookie-content">
    <h2>Cookie 设置</h2>
    <p>我们使用 Cookie 来提供、保护和改进我们的服务。您可以自定义您的偏好设置。</p>
    
    <!-- Cookie 类别选择 -->
    <div class="cookie-categories">
      <div class="category">
        <input type="checkbox" id="necessary" checked disabled>
        <label for="necessary">
          <strong>必要性 Cookie</strong>
          <span>网站正常运行所必需</span>
        </label>
      </div>
      
      <div class="category">
        <input type="checkbox" id="functional">
        <label for="functional">
          <strong>功能性 Cookie</strong>
          <span>记住您的偏好设置</span>
        </label>
      </div>
      
      <div class="category">
        <input type="checkbox" id="analytics">
        <label for="analytics">
          <strong>分析型 Cookie</strong>
          <span>帮助我们了解网站使用情况</span>
        </label>
      </div>
      
      <div class="category">
        <input type="checkbox" id="marketing">
        <label for="marketing">
          <strong>营销型 Cookie</strong>
          <span>用于提供相关广告</span>
        </label>
      </div>
    </div>
    
    <div class="cookie-actions">
      <button class="reject-all">仅必要</button>
      <button class="save-preferences">保存设置</button>
      <button class="accept-all">接受全部</button>
    </div>
    
    <div class="cookie-links">
      <a href="/cookie-policy">Cookie 政策</a>
      <a href="/privacy-policy">隐私政策</a>
    </div>
  </div>
</div>
```

### 3. 样式建议
```css
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  z-index: 9999;
  
  /* 动画效果 */
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.cookie-actions button {
  margin: 0 5px;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.reject-all {
  background: transparent;
  border: 1px solid #ccc;
}

.save-preferences {
  background: #f0f0f0;
  border: none;
}

.accept-all {
  background: #007bff;
  color: white;
  border: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cookie-actions {
    display: flex;
    flex-direction: column;
  }
  
  .cookie-actions button {
    margin: 5px 0;
    width: 100%;
  }
}
```

### 4. JavaScript 实现
```javascript
class CookieConsent {
  constructor() {
    this.consentKey = 'cookie_consent';
    this.consentExpiry = 365; // 天
    this.init();
  }
  
  init() {
    const consent = this.getConsent();
    
    if (!consent) {
      this.showBanner();
    } else {
      this.applyConsent(consent);
    }
  }
  
  showBanner() {
    // 显示横幅
    document.querySelector('.cookie-banner').style.display = 'block';
    
    // 绑定事件
    this.bindEvents();
  }
  
  bindEvents() {
    // 接受全部
    document.querySelector('.accept-all').addEventListener('click', () => {
      this.saveConsent({
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true
      });
      this.hideBanner();
    });
    
    // 仅必要
    document.querySelector('.reject-all').addEventListener('click', () => {
      this.saveConsent({
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false
      });
      this.hideBanner();
    });
    
    // 保存偏好
    document.querySelector('.save-preferences').addEventListener('click', () => {
      const preferences = {
        necessary: true,
        functional: document.getElementById('functional').checked,
        analytics: document.getElementById('analytics').checked,
        marketing: document.getElementById('marketing').checked
      };
      this.saveConsent(preferences);
      this.hideBanner();
    });
  }
  
  saveConsent(preferences) {
    const consent = {
      preferences: preferences,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    // 保存到 localStorage
    localStorage.setItem(this.consentKey, JSON.stringify(consent));
    
    // 设置 Cookie（用于服务器端验证）
    this.setCookie(this.consentKey, JSON.stringify(consent), this.consentExpiry);
    
    // 应用同意设置
    this.applyConsent(preferences);
    
    // 触发事件
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consent }));
  }
  
  getConsent() {
    const stored = localStorage.getItem(this.consentKey);
    return stored ? JSON.parse(stored).preferences : null;
  }
  
  applyConsent(preferences) {
    // 根据用户同意加载相应的脚本
    if (preferences.analytics) {
      this.loadAnalytics();
    }
    
    if (preferences.marketing) {
      this.loadMarketing();
    }
  }
  
  loadAnalytics() {
    // 加载 Google Analytics 等
    if (typeof gtag === 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);
      
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    }
  }
  
  loadMarketing() {
    // 加载营销相关脚本
    // Facebook Pixel, Google Ads 等
  }
  
  hideBanner() {
    document.querySelector('.cookie-banner').style.display = 'none';
  }
  
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
  
  // 提供撤回同意的方法
  revokeConsent() {
    localStorage.removeItem(this.consentKey);
    document.cookie = `${this.consentKey}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    window.location.reload();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new CookieConsent();
});
```

## 实施检查清单

### 合规性检查
- [ ] 横幅在设置任何非必要 Cookie 前显示
- [ ] 默认情况下仅启用必要 Cookie
- [ ] 提供明确的接受/拒绝选项
- [ ] 拒绝和接受按钮同样明显
- [ ] 提供详细的 Cookie 分类说明
- [ ] 链接到完整的 Cookie 政策
- [ ] 提供撤回同意的机制
- [ ] 记录同意的时间和版本

### 用户体验检查
- [ ] 横幅不会过度干扰用户体验
- [ ] 移动端友好
- [ ] 支持键盘导航
- [ ] 符合 WCAG 无障碍标准
- [ ] 多语言支持（如需要）
- [ ] 加载性能优化

### 技术实施检查
- [ ] Cookie 设置前检查同意状态
- [ ] 同意信息持久化存储
- [ ] 支持服务器端验证
- [ ] 第三方脚本条件加载
- [ ] 错误处理机制
- [ ] 版本控制和更新机制

## 不同场景的推荐方案

### 场景 1：仅使用必要 Cookie 的静态网站
- 可以使用简单的通知横幅
- 文案：「本网站使用必要的 Cookie 以确保网站正常运行」
- 提供链接到 Cookie 政策即可

### 场景 2：使用 Google Analytics 的博客
- 需要明确同意机制
- 默认不加载 GA
- 用户同意后才加载分析脚本

### 场景 3：电商网站
- 需要完整的分类同意系统
- 区分必要（购物车）、功能（语言偏好）、分析和营销 Cookie
- 考虑实施同意管理平台（CMP）

### 场景 4：面向全球用户的 SaaS 平台
- 实施最严格的 GDPR 标准
- 使用专业的 CMP 解决方案
- 根据用户地理位置调整显示逻辑

## 推荐的第三方解决方案

### 开源方案
1. **Osano Cookie Consent**
   - 轻量级，易于定制
   - 支持 GDPR/CCPA
   - GitHub: osano/cookieconsent

2. **Klaro!**
   - 功能完整，支持高级配置
   - 多语言支持
   - GitHub: kiprotect/klaro

### 商业方案
1. **OneTrust**
   - 企业级解决方案
   - 自动扫描和分类 Cookie
   - 合规报告功能

2. **Cookiebot**
   - 自动 Cookie 扫描
   - 月度合规报告
   - 支持 40+ 语言

3. **TrustArc**
   - 全面的隐私管理平台
   - 适合大型企业

## Cookie 政策模板

```markdown
# Cookie 政策

最后更新：[日期]

## 什么是 Cookie
Cookie 是存储在您设备上的小型文本文件，用于记住您的偏好设置和改善网站体验。

## 我们使用的 Cookie 类型

### 必要性 Cookie
这些 Cookie 对网站的基本功能至关重要，包括：
- 会话管理
- 安全认证
- 负载均衡

### 功能性 Cookie
帮助我们记住您的选择：
- 语言偏好
- 界面主题
- 字体大小

### 分析型 Cookie
帮助我们了解访问者如何使用网站：
- Google Analytics
- 热图分析
- 性能监控

### 营销型 Cookie
用于提供相关广告：
- 再营销
- 兴趣定向
- 广告效果追踪

## 如何管理 Cookie
您可以通过以下方式管理 Cookie：
1. 使用我们的 Cookie 设置工具
2. 浏览器设置
3. 第三方工具

## 联系我们
如有任何问题，请联系：
- 邮箱：privacy@example.com
- 电话：+1-xxx-xxx-xxxx
```

## 总结与建议

### 立即行动项
1. **评估当前 Cookie 使用**：审计网站所有 Cookie
2. **选择合规策略**：根据目标市场选择合适的方案
3. **实施技术方案**：部署 Cookie 同意管理系统
4. **准备法律文档**：更新隐私政策和 Cookie 政策
5. **持续监控**：定期审查和更新

### 关键原则
- **透明度优先**：清晰说明 Cookie 用途
- **用户控制**：提供真实的选择权
- **最小化原则**：只收集必要的数据
- **安全存储**：保护用户数据安全

### 风险提示
- 不合规可能导致巨额罚款
- 用户信任度下降
- 品牌声誉受损
- 业务运营受限

## 相关资源
- [GDPR 官方指南](https://gdpr.eu/)
- [CCPA 合规指南](https://oag.ca.gov/privacy/ccpa)
- [中国个人信息保护法](http://www.npc.gov.cn/npc/c30834/202108/a8c4e3672c74491a80b53a172bb753fe.shtml)
- [IAB Europe TCF 2.0](https://iabeurope.eu/tcf-2-0/)
