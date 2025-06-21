# Manus Task Manager - 完整部署和使用指南

## 📋 **項目概述**

Manus Task Manager是一個基於Playwright的智能任務管理系統，專門設計用於自動化收集和分析Manus平台的任務數據，同時提供TRAE（Trae Automation Engine）的完整控制功能。

### 🎯 **核心功能**
- **Manus平台智能介入** - 自動化任務收集和對話分析
- **TRAE智能控制** - 替代傳統AppleScript的現代化解決方案
- **統一數據存儲** - SQLite數據庫的智能分類存儲
- **跨平台支持** - 支持Mac、Windows、Linux

## 🏗️ **系統架構**

### **第一部分：Manus智能介入**

#### **🎯 核心功能模塊**

##### **1. 任務列表智能遍歷**
```javascript
// 自動遍歷所有任務
async function traverseAllTasks() {
    const tasks = await page.$$('.task-item');
    for (const task of tasks) {
        await task.click();
        await collectTaskData();
        await page.goBack();
    }
}
```

**功能特色**：
- ✅ **智能分頁處理** - 自動處理多頁任務列表
- ✅ **斷點續傳** - 支持從中斷點繼續收集
- ✅ **重複檢測** - 避免重複收集相同任務
- ✅ **錯誤恢復** - 自動處理頁面加載失敗

##### **2. 對話歷史完整收集**
```javascript
// 收集完整對話歷史
async function collectConversationHistory() {
    await autoScrollToLoadAll();
    const messages = await extractAllMessages();
    return classifyMessages(messages);
}
```

**收集內容**：
- 📝 **完整對話內容** - 用戶和AI的所有交互
- 🕒 **時間戳信息** - 精確的消息時間記錄
- 👤 **發送者識別** - 區分用戶和AI消息
- 🔗 **關聯信息** - 任務ID和會話ID

##### **3. 智能消息分類系統**
```javascript
// 智能分類器
class MessageClassifier {
    classify(message) {
        if (this.isThinking(message)) return '[思考]';
        if (this.isObservation(message)) return '[觀察]';
        if (this.isAction(message)) return '[行動]';
        return '[其他]';
    }
}
```

**分類標準**：
- **[思考]** - 分析、推理、計劃類消息
- **[觀察]** - 信息收集、狀態檢查類消息
- **[行動]** - 執行操作、實施方案類消息
- **[其他]** - 不符合上述分類的消息

##### **4. 文件批量下載管理**
```javascript
// 四種類型文件下載
const FILE_TYPES = {
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt'],
    IMAGES: ['.jpg', '.png', '.gif', '.svg'],
    CODE: ['.js', '.py', '.html', '.css'],
    DATA: ['.json', '.csv', '.xml', '.yaml']
};
```

**下載功能**：
- 📄 **文檔文件** - PDF、Word、文本文件
- 🖼️ **圖像文件** - 各種格式的圖片
- 💻 **代碼文件** - 源代碼和腳本文件
- 📊 **數據文件** - JSON、CSV等數據格式

##### **5. 自動消息發送**
```javascript
// 智能消息發送
async function sendMessage(content, options = {}) {
    await waitForInputReady();
    await typeMessage(content);
    if (options.autoSend) {
        await clickSendButton();
    }
    return await waitForResponse();
}
```

**發送特色**：
- ⚡ **智能等待** - 自動等待輸入框就緒
- 🎯 **精確定位** - 多種方式定位輸入元素
- 📤 **發送確認** - 驗證消息成功發送
- 🔄 **重試機制** - 失敗時自動重試

### **第二部分：TRAE智能介入**

#### **🎯 TRAE控制系統**

##### **1. TRAE Playwright控制器**
```javascript
// 替代AppleScript的現代化解決方案
class TraePlaywrightController {
    async sendMessage(message) {
        await this.locateInputField();
        await this.typeMessage(message);
        await this.submitMessage();
    }
    
    async extractHistory() {
        return await this.scrollAndCollect();
    }
}
```

**替代功能**：
- ❌ **不再需要AppleScript** - 完全基於Playwright
- ✅ **跨平台兼容** - 支持所有主流操作系統
- ✅ **更穩定可靠** - 避免AppleScript的兼容性問題
- ✅ **更易維護** - 統一的JavaScript代碼

##### **2. TRAE VS Code控制器**
```javascript
// VS Code插件控制
class TraeVSCodeController {
    async controlVSCodeTrae() {
        await this.connectToVSCode();
        await this.executeTraeCommands();
    }
}
```

**控制功能**：
- 🔧 **VS Code集成** - 直接控制VS Code中的Trae插件
- ⌨️ **快捷鍵模擬** - 模擬鍵盤快捷鍵操作
- 📋 **命令執行** - 執行Trae相關命令
- 🔄 **狀態同步** - 同步VS Code和Trae狀態

##### **3. 消息發送系統（替代trae-send）**
```javascript
// 現代化消息發送
async function traeSend(message, options = {}) {
    const controller = new TraePlaywrightController();
    return await controller.sendMessage(message, options);
}
```

**功能對比**：
- **舊方式（trae-send）**: AppleScript + 系統依賴
- **新方式**: Playwright + 跨平台支持
- **優勢**: 更快、更穩定、更易調試

##### **4. 歷史提取系統（替代trae-history）**
```javascript
// 智能歷史提取
async function traeHistory(options = {}) {
    const controller = new TraePlaywrightController();
    const history = await controller.extractHistory();
    return classifyAndStore(history);
}
```

**提取能力**：
- 📚 **完整歷史** - 提取所有對話記錄
- 🏷️ **智能分類** - 自動分類消息類型
- 💾 **本地存儲** - 保存到SQLite數據庫
- 🔍 **搜索功能** - 支持歷史記錄搜索

##### **5. 分享鏈接管理（替代trae-sync部分功能）**
```javascript
// 分享鏈接自動化
async function traeShare() {
    const shareLink = await extractShareLink();
    await copyToClipboard(shareLink);
    return shareLink;
}
```

**管理功能**：
- 🔗 **自動獲取** - 自動獲取分享鏈接
- 📋 **剪貼板操作** - 自動複製到剪貼板
- 📝 **鏈接記錄** - 記錄所有分享鏈接
- 🔄 **批量處理** - 支持批量分享操作

### **第三部分：統一數據存儲**

#### **📊 SQLite數據庫設計**

##### **1. 數據庫結構**
```sql
-- 任務表
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    task_id TEXT UNIQUE,
    title TEXT,
    status TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

-- 消息表
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    task_id TEXT,
    sender TEXT,
    content TEXT,
    message_type TEXT,
    timestamp DATETIME,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- 文件表
CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    task_id TEXT,
    filename TEXT,
    file_type TEXT,
    file_path TEXT,
    download_time DATETIME,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);
```

##### **2. 關聯式數據結構**
```javascript
// 數據關聯管理
class DatabaseManager {
    async linkTaskToMessages(taskId, messages) {
        for (const message of messages) {
            await this.insertMessage({
                task_id: taskId,
                ...message
            });
        }
    }
    
    async getTaskWithMessages(taskId) {
        const task = await this.getTask(taskId);
        const messages = await this.getMessagesByTask(taskId);
        const files = await this.getFilesByTask(taskId);
        
        return { task, messages, files };
    }
}
```

##### **3. 智能分類存儲**
```javascript
// 智能存儲策略
class SmartStorage {
    async storeMessage(message) {
        const classified = this.classifier.classify(message);
        await this.db.insert('messages', {
            ...message,
            message_type: classified.type,
            confidence: classified.confidence
        });
    }
}
```

##### **4. 統計分析功能**
```javascript
// 數據分析
class DataAnalyzer {
    async generateStatistics() {
        return {
            totalTasks: await this.countTasks(),
            messagesByType: await this.countMessagesByType(),
            filesByType: await this.countFilesByType(),
            activityTrends: await this.getActivityTrends()
        };
    }
}
```

## 🚀 **快速開始指南**

### **系統要求**
- **Node.js** 16.0 或更高版本
- **npm** 或 **yarn** 包管理器
- **Chrome/Chromium** 瀏覽器
- **4GB RAM** 最低要求
- **1GB** 可用磁盤空間

### **安裝步驟**

#### **1. 克隆項目**
```bash
# 克隆aicore0621倉庫
git clone https://github.com/alexchuang650730/aicore0621.git

# 進入manus-task-manager目錄
cd aicore0621/manus-task-manager
```

#### **2. 安裝依賴**
```bash
# 安裝Node.js依賴
npm install

# 或使用yarn
yarn install
```

#### **3. 安裝瀏覽器**
```bash
# 安裝Playwright瀏覽器
npm run install-browsers

# 或手動安裝
npx playwright install chromium
```

#### **4. 配置設置**
```bash
# 複製配置模板
cp src/config/config.example.js src/config/config.js

# 編輯配置文件
nano src/config/config.js
```

#### **5. 啟動系統**
```bash
# 啟動完整系統
npm start

# 或分別啟動組件
npm run start:manus    # 只啟動Manus功能
npm run start:trae     # 只啟動TRAE功能
```

### **配置說明**

#### **基本配置**
```javascript
// src/config/config.js
module.exports = {
    // Manus平台配置
    manus: {
        baseUrl: 'https://your-manus-instance.com',
        loginUrl: 'https://your-manus-instance.com/login',
        taskListUrl: 'https://your-manus-instance.com/tasks'
    },
    
    // TRAE配置
    trae: {
        vscodeIntegration: true,
        autoClassification: true,
        historyDepth: 1000
    },
    
    // 數據庫配置
    database: {
        path: './data/manus_tasks.db',
        backup: true,
        backupInterval: 3600000 // 1小時
    },
    
    // 下載配置
    downloads: {
        path: './downloads',
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['.pdf', '.doc', '.jpg', '.png', '.js', '.py']
    }
};
```

#### **高級配置**
```javascript
// 性能優化配置
const advancedConfig = {
    performance: {
        concurrentTasks: 3,
        pageTimeout: 30000,
        retryAttempts: 3,
        delayBetweenActions: 1000
    },
    
    // 分類器配置
    classifier: {
        thinkingKeywords: ['分析', '思考', '考慮', '評估'],
        observationKeywords: ['檢查', '查看', '發現', '注意到'],
        actionKeywords: ['執行', '運行', '創建', '修改']
    }
};
```

## 🔧 **詳細使用說明**

### **Manus功能使用**

#### **1. 任務收集**
```bash
# 收集所有任務
node src/manus_comprehensive_manager.js --collect-all

# 收集特定任務
node src/manus_comprehensive_manager.js --task-id="task_123"

# 增量收集（只收集新任務）
node src/manus_comprehensive_manager.js --incremental
```

#### **2. 對話分析**
```bash
# 分析所有對話
node src/manus_comprehensive_manager.js --analyze-conversations

# 重新分類消息
node src/manus_comprehensive_manager.js --reclassify

# 生成分析報告
node src/manus_comprehensive_manager.js --generate-report
```

#### **3. 文件下載**
```bash
# 下載所有文件
node src/manus_comprehensive_manager.js --download-files

# 只下載特定類型
node src/manus_comprehensive_manager.js --download-files --type=images

# 批量下載
node src/manus_comprehensive_manager.js --batch-download
```

### **TRAE功能使用**

#### **1. 消息發送**
```bash
# 發送單條消息
node src/trae-playwright-controller.js --send "Hello, TRAE!"

# 批量發送
node src/trae-playwright-controller.js --batch-send messages.txt

# 交互式發送
node src/trae-playwright-controller.js --interactive
```

#### **2. 歷史提取**
```bash
# 提取完整歷史
node src/trae-playwright-controller.js --extract-history

# 提取最近N條
node src/trae-playwright-controller.js --extract-history --limit=100

# 提取並分類
node src/trae-playwright-controller.js --extract-classify
```

#### **3. VS Code集成**
```bash
# 啟動VS Code控制器
node src/trae-vscode-controller.js --start

# 執行TRAE命令
node src/trae-vscode-controller.js --command="trae.analyze"

# 同步狀態
node src/trae-vscode-controller.js --sync
```

## 🛠️ **常見問題解決**

### **安裝問題**

#### **Q1: npm install失敗**
```bash
# 清理緩存
npm cache clean --force

# 刪除node_modules重新安裝
rm -rf node_modules package-lock.json
npm install
```

#### **Q2: Playwright瀏覽器安裝失敗**
```bash
# 手動下載瀏覽器
npx playwright install chromium --force

# 設置代理（如果需要）
export HTTPS_PROXY=http://your-proxy:port
npx playwright install
```

#### **Q3: 權限問題（Mac/Linux）**
```bash
# 給予執行權限
chmod +x src/*.js

# 使用sudo（如果必要）
sudo npm install -g playwright
```

### **運行問題**

#### **Q1: 無法連接到Manus平台**
```javascript
// 檢查配置文件
const config = require('./src/config/config.js');
console.log('Manus URL:', config.manus.baseUrl);

// 測試網絡連接
curl -I https://your-manus-instance.com
```

#### **Q2: 數據庫錯誤**
```bash
# 檢查數據庫文件
ls -la data/manus_tasks.db

# 重新初始化數據庫
node src/database/init.js --reset

# 備份恢復
cp data/backup/manus_tasks_backup.db data/manus_tasks.db
```

#### **Q3: 內存使用過高**
```javascript
// 調整配置
const config = {
    performance: {
        concurrentTasks: 1,  // 減少並發
        pageTimeout: 15000,  // 減少超時時間
        memoryLimit: 512     // 設置內存限制
    }
};
```

### **性能優化**

#### **1. 並發控制**
```javascript
// 優化並發設置
const optimizedConfig = {
    performance: {
        concurrentTasks: Math.min(3, os.cpus().length),
        batchSize: 10,
        delayBetweenBatches: 2000
    }
};
```

#### **2. 內存管理**
```javascript
// 定期清理內存
setInterval(() => {
    if (global.gc) {
        global.gc();
    }
}, 60000);
```

#### **3. 數據庫優化**
```sql
-- 創建索引
CREATE INDEX idx_messages_task_id ON messages(task_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_files_task_id ON files(task_id);

-- 定期清理
DELETE FROM messages WHERE timestamp < datetime('now', '-30 days');
```

## 📊 **API參考**

### **Manus API**

#### **任務管理**
```javascript
// 獲取任務列表
const tasks = await manusManager.getTasks({
    limit: 50,
    offset: 0,
    status: 'active'
});

// 獲取任務詳情
const taskDetail = await manusManager.getTask(taskId);

// 更新任務狀態
await manusManager.updateTaskStatus(taskId, 'completed');
```

#### **消息管理**
```javascript
// 發送消息
const result = await manusManager.sendMessage(taskId, {
    content: 'Hello, Manus!',
    type: 'user'
});

// 獲取消息歷史
const messages = await manusManager.getMessages(taskId, {
    limit: 100,
    order: 'desc'
});
```

### **TRAE API**

#### **控制器API**
```javascript
// 初始化TRAE控制器
const trae = new TraePlaywrightController({
    headless: false,
    timeout: 30000
});

// 發送消息
await trae.sendMessage('Analyze this code');

// 提取歷史
const history = await trae.extractHistory();

// 關閉控制器
await trae.close();
```

#### **VS Code集成API**
```javascript
// VS Code控制器
const vscode = new TraeVSCodeController();

// 執行命令
await vscode.executeCommand('trae.analyze');

// 獲取狀態
const status = await vscode.getStatus();
```

## 🔒 **安全考慮**

### **數據安全**
- **本地存儲** - 所有數據存儲在本地SQLite數據庫
- **加密選項** - 支持數據庫加密（可選）
- **訪問控制** - 文件權限控制
- **數據備份** - 自動備份機制

### **網絡安全**
- **HTTPS支持** - 強制使用HTTPS連接
- **代理支持** - 支持企業代理設置
- **證書驗證** - SSL證書驗證
- **超時控制** - 網絡請求超時保護

### **隱私保護**
- **無雲端傳輸** - 數據不上傳到雲端
- **本地處理** - 所有處理在本地進行
- **用戶控制** - 用戶完全控制數據
- **清理選項** - 支持數據清理和刪除

## 📈 **監控和日誌**

### **日誌配置**
```javascript
// 日誌設置
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console()
    ]
});
```

### **性能監控**
```javascript
// 性能指標收集
class PerformanceMonitor {
    async collectMetrics() {
        return {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime(),
            taskCount: await this.getTaskCount(),
            messageCount: await this.getMessageCount()
        };
    }
}
```

## 🔄 **更新和維護**

### **版本更新**
```bash
# 檢查更新
git fetch origin
git status

# 更新代碼
git pull origin main

# 更新依賴
npm update

# 重新安裝瀏覽器（如果需要）
npm run install-browsers
```

### **數據遷移**
```bash
# 備份當前數據
cp data/manus_tasks.db data/backup/manus_tasks_$(date +%Y%m%d).db

# 運行遷移腳本
node scripts/migrate.js

# 驗證遷移結果
node scripts/verify-migration.js
```

### **清理維護**
```bash
# 清理舊日誌
find logs/ -name "*.log" -mtime +30 -delete

# 清理臨時文件
rm -rf temp/*

# 優化數據庫
node scripts/optimize-database.js
```

## 🆘 **技術支持**

### **獲取幫助**
- **GitHub Issues** - https://github.com/alexchuang650730/aicore0621/issues
- **文檔** - 查看docs目錄下的詳細文檔
- **示例** - 參考examples目錄下的示例代碼

### **調試模式**
```bash
# 啟用調試模式
DEBUG=manus:* node src/manus_comprehensive_manager.js

# 詳細日誌
LOG_LEVEL=debug npm start

# 性能分析
node --inspect src/manus_comprehensive_manager.js
```

### **故障排除**
```bash
# 檢查系統狀態
node scripts/health-check.js

# 生成診斷報告
node scripts/generate-diagnostic.js

# 重置系統
node scripts/reset-system.js --confirm
```

---

**文檔版本**: 2.0  
**最後更新**: 2025-06-21  
**項目地址**: https://github.com/alexchuang650730/aicore0621  
**維護者**: AICore0621 Team

