# Trae VS Code插件控制器 - 使用指南

## 🎯 概述

Trae VS Code插件控制器是專門為控制VS Code中的Trae插件而設計的自動化工具。它使用Playwright技術來模擬用戶操作，實現對Trae插件的程序化控制。

## 🏗️ 系統架構

### VS Code + Trae插件布局
```
┌─────────────────────────────────────────────────────────────┐
│ VS Code 窗口                                                │
├─────────┬─────────────────────────┬─────────────────────────┤
│ 文件    │ 編輯器區域              │ Trae插件面板            │
│ 資源    │ (Documentation.tsx)     │ ┌─────────────────────┐ │
│ 管理器  │                         │ │ 對話歷史            │ │
│         │                         │ │ ┌─────────────────┐ │ │
│ ├─docs  │ const Documentation...  │ │ │ Alex Chuang     │ │ │
│ ├─src   │                         │ │ │ 你好...         │ │ │
│ └─...   │                         │ │ └─────────────────┘ │ │
│         │                         │ │                     │ │
│         │                         │ │ ┌─────────────────┐ │ │
│         │                         │ │ │ 輸入框          │ │ │
│         │                         │ │ │ [n____________] │ │ │
│         │                         │ │ │ [智能體][發送]  │ │ │
│         │                         │ │ └─────────────────┘ │ │
│         │                         │ └─────────────────────┘ │
└─────────┴─────────────────────────┴─────────────────────────┘
```

## 🚀 快速開始

### 1. 環境準備

#### 安裝依賴
```bash
cd manus-task-manager
npm install
```

#### 啟動VS Code（調試模式）
```bash
# macOS
/Applications/Visual\ Studio\ Code.app/Contents/MacOS/Electron --remote-debugging-port=9222 /path/to/your/project

# Linux
code --remote-debugging-port=9222 /path/to/your/project

# Windows
"C:\Users\%USERNAME%\AppData\Local\Programs\Microsoft VS Code\Code.exe" --remote-debugging-port=9222 C:\path\to\your\project
```

#### 確保Trae插件已安裝並打開
1. 在VS Code中安裝Trae插件
2. 打開Trae面板（通常在右側邊欄）
3. 確保可以看到對話界面和輸入框

### 2. 基本使用

#### 命令行方式
```bash
# 發送消息
node src/trae-vscode-cli.js send "你好，這是測試消息"

# 提取對話歷史
node src/trae-vscode-cli.js history

# 測試連接
node src/trae-vscode-cli.js test

# 截圖調試
node src/trae-vscode-cli.js screenshot
```

#### 編程方式
```javascript
const { TraeVSCodeController } = require('./src/trae-vscode-controller');

async function example() {
    const controller = new TraeVSCodeController({
        workspaceDir: '/path/to/your/project',
        headless: false
    });
    
    try {
        // 初始化
        await controller.initialize();
        
        // 發送消息
        const result = await controller.sendMessage('測試消息');
        console.log('發送結果:', result);
        
        // 提取歷史
        const history = await controller.extractHistory();
        console.log('歷史記錄:', history);
        
    } finally {
        await controller.cleanup();
    }
}

example();
```

## 🔧 配置選項

### 基本配置
```javascript
{
    // VS Code配置
    vscodeExecutablePath: '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
    workspaceDir: '/path/to/your/project',
    
    // 控制配置
    headless: false,        // 是否無頭模式
    timeout: 30000,         // 超時時間（毫秒）
    waitTime: 2000,         // 等待時間（毫秒）
    
    // 輸出配置
    outputDir: '/tmp/trae-vscode',
    logLevel: 'info'
}
```

### 選擇器配置
```javascript
{
    selectors: {
        // Trae面板
        traePanel: '[data-view-id="trae"]',
        traeSidebar: '.sidebar-pane-header:has-text("Trae")',
        
        // 輸入框和按鈕
        inputBox: 'textarea[placeholder*="輸入"], input[type="text"]',
        sendButton: 'button[title*="發送"], button[title*="Send"]',
        
        // 對話元素
        messageContainer: '.message, .chat-message',
        userMessage: '.user-message, .message.user',
        assistantMessage: '.assistant-message, .message.assistant'
    }
}
```

## 📋 API參考

### TraeVSCodeController 類

#### 構造函數
```javascript
new TraeVSCodeController(config)
```

#### 主要方法

##### initialize()
初始化控制器，啟動VS Code連接
```javascript
await controller.initialize();
```

##### sendMessage(message, options)
發送消息到Trae插件
```javascript
const result = await controller.sendMessage('你好，Trae！');
// 返回: { success: boolean, message: string, error?: string }
```

##### extractHistory(options)
提取完整的對話歷史
```javascript
const history = await controller.extractHistory();
// 返回: { 
//   success: boolean, 
//   messages: object, 
//   totalCount: number, 
//   outputFile: string 
// }
```

##### takeScreenshot(filename)
截圖當前狀態（調試用）
```javascript
const path = await controller.takeScreenshot('debug.png');
```

##### cleanup()
清理資源，關閉瀏覽器連接
```javascript
await controller.cleanup();
```

### 便捷函數

#### sendMessageToTrae(message, config)
快速發送消息的便捷函數
```javascript
const { sendMessageToTrae } = require('./src/trae-vscode-controller');

const result = await sendMessageToTrae('測試消息', {
    workspaceDir: '/path/to/project'
});
```

#### extractTraeHistory(config)
快速提取歷史的便捷函數
```javascript
const { extractTraeHistory } = require('./src/trae-vscode-controller');

const history = await extractTraeHistory({
    outputDir: '/custom/output/dir'
});
```

## 🎯 高級功能

### 智能元素定位
控制器使用多重策略來定位Trae插件的UI元素：

1. **CSS選擇器定位**：使用預定義的選擇器
2. **文本內容定位**：通過按鈕文字等定位
3. **位置定位**：當其他方法失敗時使用座標定位
4. **活動元素檢測**：檢測當前聚焦的元素

### 消息分類系統
自動將提取的對話歷史分類為：

- **思考**：包含分析、評估、計劃等關鍵詞的消息
- **觀察**：包含發現、檢測、確認等關鍵詞的消息
- **行動**：包含執行、創建、操作等關鍵詞的消息
- **其他**：不符合上述分類的消息

### 錯誤處理和重試
- 自動重試失敗的操作
- 智能降級策略（CSS選擇器 → 位置定位）
- 詳細的錯誤日誌和調試信息

## 🐛 故障排除

### 常見問題

#### 1. 無法連接到VS Code
**症狀**：`Failed to connect to VS Code`
**解決方案**：
```bash
# 確保VS Code以調試模式啟動
code --remote-debugging-port=9222 /your/project

# 檢查端口是否被佔用
lsof -i :9222

# 嘗試不同的端口
code --remote-debugging-port=9223 /your/project
```

#### 2. 找不到Trae插件面板
**症狀**：`Cannot find Trae panel`
**解決方案**：
1. 確保Trae插件已安裝並啟用
2. 手動打開Trae面板
3. 檢查插件是否在右側邊欄
4. 嘗試使用命令面板：`Cmd+Shift+P` → `Trae`

#### 3. 輸入框定位失敗
**症狀**：`Cannot find input box`
**解決方案**：
1. 截圖調試：`node src/trae-vscode-cli.js screenshot`
2. 檢查Trae面板是否完全加載
3. 調整選擇器配置
4. 使用位置定位作為備用方案

#### 4. 消息發送失敗
**症狀**：`Message send failed`
**解決方案**：
1. 確保輸入框可見且可編輯
2. 檢查發送按鈕是否可點擊
3. 嘗試使用Enter鍵發送
4. 增加等待時間

### 調試技巧

#### 啟用詳細日誌
```javascript
const controller = new TraeVSCodeController({
    logLevel: 'debug'
});
```

#### 截圖調試
```bash
# 在每個關鍵步驟截圖
node src/trae-vscode-cli.js screenshot
```

#### 檢查VS Code進程
```bash
# macOS/Linux
ps aux | grep "Visual Studio Code"

# 檢查調試端口
netstat -an | grep 9222
```

## 🔄 與原AppleScript的對比

| 特性 | AppleScript | Trae VS Code Controller |
|------|-------------|------------------------|
| 穩定性 | ⚠️ 依賴UI變化 | ✅ 多重定位策略 |
| 速度 | 🐌 較慢 | ⚡ 快速 |
| 調試 | ❌ 困難 | ✅ 豐富的調試工具 |
| 跨平台 | ❌ 僅macOS | ✅ macOS/Linux/Windows |
| 錯誤處理 | ❌ 基礎 | ✅ 完善的錯誤處理 |
| 可擴展性 | ❌ 有限 | ✅ 高度可擴展 |

## 🚀 最佳實踐

### 1. 環境設置
- 始終以調試模式啟動VS Code
- 確保Trae插件面板可見
- 使用穩定的工作區目錄

### 2. 錯誤處理
- 使用try-catch包裝所有操作
- 檢查返回值的success字段
- 保存調試截圖用於問題診斷

### 3. 性能優化
- 重用控制器實例進行多次操作
- 適當設置超時時間
- 使用headless模式提高速度

### 4. 安全考慮
- 不要在生產環境中暴露調試端口
- 定期清理輸出目錄
- 保護敏感的對話內容

## 📈 未來規劃

- [ ] 支持更多VS Code插件
- [ ] 增強的消息分類算法
- [ ] 實時對話監控
- [ ] 批量操作支持
- [ ] Web界面管理工具

---

**開發團隊**: Manus AI Team  
**最後更新**: 2025-06-20  
**版本**: v2.0.0 (VS Code插件專版)

