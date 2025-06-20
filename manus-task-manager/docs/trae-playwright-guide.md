# Trae Playwright控制器 - 使用指南

## 🎯 概述

Trae Playwright控制器是一個現代化的解決方案，用於替代傳統的AppleScript方法來控制Trae應用。它提供了統一的API來執行所有Trae相關的自動化操作。

## 🚀 主要功能

### 1. 消息發送 (替代 trae-send)
- ✅ 智能輸入框定位
- ✅ 多種發送方式支持
- ✅ 發送結果驗證
- ✅ 座標備用定位

### 2. 歷史提取 (替代 trae-history)
- ✅ 完整對話歷史獲取
- ✅ 智能消息分類 [思考][觀察][行動]
- ✅ 自動滾動加載
- ✅ 結構化數據輸出

### 3. 分享鏈接 (替代 trae-sync 部分功能)
- ✅ 自動獲取分享鏈接
- ✅ 剪貼板內容提取
- ✅ 多種鏈接源支持

## 📦 安裝和配置

### 1. 安裝依賴
```bash
cd manus-task-manager
npm install playwright
```

### 2. 安裝瀏覽器
```bash
npx playwright install chromium
```

### 3. 配置設置
```javascript
const config = {
    traeUrl: 'https://manus.im/app/your-task-id',
    headless: false,  // 設為true可無頭運行
    timeout: 30000,
    waitTime: 2000,
    chromeExecutablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
};
```

## 🛠️ 使用方法

### 方法1: 直接使用控制器類

```javascript
const { TraePlaywrightController } = require('./src/trae-playwright-controller');

async function example() {
    const controller = new TraePlaywrightController({
        traeUrl: 'https://manus.im/app/your-task-id',
        headless: false
    });
    
    try {
        // 導航到Trae頁面
        await controller.navigateToTrae();
        
        // 發送消息
        const sendResult = await controller.sendMessage('你好，這是測試消息');
        console.log('發送結果:', sendResult);
        
        // 提取歷史
        const historyResult = await controller.extractHistory();
        console.log('歷史記錄:', historyResult);
        
        // 獲取分享鏈接
        const shareResult = await controller.getShareLink();
        console.log('分享鏈接:', shareResult);
        
    } finally {
        await controller.cleanup();
    }
}

example();
```

### 方法2: 使用便捷函數

```javascript
const { sendMessageToTrae, extractTraeHistory, getTraeShareLink } = require('./src/trae-playwright-controller');

// 發送消息
const sendResult = await sendMessageToTrae('測試消息', {
    taskUrl: 'https://manus.im/app/your-task-id'
});

// 提取歷史
const historyResult = await extractTraeHistory({
    taskUrl: 'https://manus.im/app/your-task-id'
});

// 獲取分享鏈接
const shareResult = await getTraeShareLink({
    taskUrl: 'https://manus.im/app/your-task-id'
});
```

### 方法3: 使用命令行工具

```bash
# 發送消息
node src/trae-cli.js send "你好，這是測試消息"

# 發送消息到特定任務
node src/trae-cli.js send "測試" --url "https://manus.im/app/task123"

# 提取歷史記錄
node src/trae-cli.js history

# 獲取分享鏈接
node src/trae-cli.js share

# 測試連接
node src/trae-cli.js test

# 配置管理
node src/trae-cli.js config --show
node src/trae-cli.js config --set traeUrl=https://manus.im/app/mytask
```

## 🎯 智能元素定位

### 輸入框定位策略
1. **CSS選擇器匹配**
   - `textarea[placeholder*="輸入"]`
   - `[contenteditable="true"]`
   - `.input-box`, `.message-input`

2. **座標備用定位**
   - 使用確認的座標 `(1115, 702)`
   - 自動聚焦驗證

### 發送按鈕定位策略
1. **按鈕文本匹配**
   - `button:has-text("發送")`
   - `button:has-text("Send")`
   - `button[type="submit"]`

2. **座標備用定位**
   - 使用確認的座標 `(1310, 702)`

## 📊 消息分類系統

### 自動分類規則
```javascript
const keywords = {
    '思考': ['分析', '考慮', '評估', '判斷', '推理', '計劃', '策略', '設計'],
    '觀察': ['發現', '注意到', '觀察', '檢測', '識別', '確認', '檢查', '監測'],
    '行動': ['執行', '運行', '創建', '修改', '實施', '完成', '操作', '處理']
};
```

### 輸出格式
```json
{
    "timestamp": "2025-06-20T21:00:00.000Z",
    "totalMessages": 150,
    "categorized": {
        "思考": [/* 思考類消息 */],
        "觀察": [/* 觀察類消息 */],
        "行動": [/* 行動類消息 */],
        "其他": [/* 其他消息 */]
    },
    "raw": [/* 所有原始消息 */]
}
```

## 🔧 高級配置

### 選擇器自定義
```javascript
const config = {
    selectors: {
        inputBox: 'textarea[placeholder*="輸入"]',
        sendButton: 'button:has-text("發送")',
        messageContainer: '.message',
        conversationHistory: '.conversation',
        shareButton: 'button:has-text("Share")',
        copyButton: 'button:has-text("Copy")'
    }
};
```

### 超時和等待設置
```javascript
const config = {
    timeout: 30000,        // 全局超時
    waitTime: 2000,        // 操作間等待
    viewport: { width: 1920, height: 1080 }
};
```

## 🚨 錯誤處理

### 常見錯誤和解決方案

1. **無法找到輸入框**
   ```
   解決方案：
   - 檢查頁面是否完全加載
   - 更新選擇器配置
   - 使用座標備用方法
   ```

2. **消息發送失敗**
   ```
   解決方案：
   - 確認網絡連接
   - 檢查Trae頁面狀態
   - 增加等待時間
   ```

3. **瀏覽器啟動失敗**
   ```
   解決方案：
   - 檢查Chrome路徑設置
   - 確認Playwright安裝
   - 嘗試無頭模式
   ```

## 📈 性能優化

### 建議設置
```javascript
const optimizedConfig = {
    headless: true,           // 無頭模式更快
    timeout: 15000,           // 適當的超時時間
    waitTime: 1000,           // 減少等待時間
    viewport: { width: 1280, height: 720 }  // 較小的視窗
};
```

### 批量操作
```javascript
// 批量發送消息
const messages = ['消息1', '消息2', '消息3'];
const controller = new TraePlaywrightController(config);

await controller.navigateToTrae();
for (const message of messages) {
    await controller.sendMessage(message);
    await new Promise(resolve => setTimeout(resolve, 1000));
}
await controller.cleanup();
```

## 🔄 與現有系統整合

### 整合到Manus任務管理系統
```javascript
const { TraePlaywrightController } = require('./trae-playwright-controller');
const { ManusTaskManager } = require('./manus_comprehensive_manager');

class IntegratedManager extends ManusTaskManager {
    constructor(config) {
        super(config);
        this.traeController = new TraePlaywrightController(config.trae);
    }
    
    async sendMessageToTask(taskId, message) {
        const taskUrl = `https://manus.im/app/${taskId}`;
        await this.traeController.navigateToTrae(taskUrl);
        return await this.traeController.sendMessage(message);
    }
}
```

## 📝 日誌和調試

### 啟用詳細日誌
```javascript
const config = {
    logLevel: 'debug',
    outputDir: '/tmp/trae-logs'
};
```

### 截圖調試
```javascript
// 自動截圖
await controller.takeScreenshot('debug-screenshot.png');

// 錯誤時截圖
try {
    await controller.sendMessage(message);
} catch (error) {
    await controller.takeScreenshot('error-screenshot.png');
    throw error;
}
```

## 🎉 優勢對比

### vs AppleScript方法

| 特性 | AppleScript | Playwright |
|------|-------------|------------|
| 穩定性 | ⚠️ 依賴UI變化 | ✅ 多重定位策略 |
| 速度 | 🐌 較慢 | ⚡ 快速 |
| 調試 | ❌ 困難 | ✅ 豐富的調試工具 |
| 跨平台 | ❌ 僅macOS | ✅ 跨平台支持 |
| 可擴展性 | ❌ 有限 | ✅ 高度可擴展 |
| 錯誤處理 | ❌ 基礎 | ✅ 完善的錯誤處理 |

## 🔮 未來擴展

### 計劃功能
- [ ] 實時消息監聽
- [ ] 批量任務處理
- [ ] 智能重試機制
- [ ] 性能監控
- [ ] 雲端部署支持

---

**這個統一的Playwright解決方案完全替代了原有的AppleScript方法，提供了更穩定、更快速、更可靠的Trae自動化控制！** 🎯

