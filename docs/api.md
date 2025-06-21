# Manus任務管理系統 - API文檔

## 📚 API 概述

本文檔詳細說明了Manus任務管理系統的所有類別、方法和函數。

## 🏗️ 核心架構

### 系統組件
```
ManusTaskManager (主控制器)
├── ManusDatabase (數據庫管理)
├── TaskProcessor (任務處理)
├── FileManager (文件管理)
├── MessageClassifier (消息分類)
└── ReportGenerator (報告生成)
```

## 🗄️ ManusDatabase 類

### 構造函數
```javascript
constructor(dbPath)
```
**參數:**
- `dbPath` (string): SQLite數據庫文件路徑

**範例:**
```javascript
const db = new ManusDatabase('/path/to/database.db');
```

### 方法

#### `async init()`
初始化數據庫連接並創建表格。

**返回值:** `Promise<void>`

**範例:**
```javascript
await db.init();
```

#### `async createTask(taskData)`
創建新任務記錄。

**參數:**
- `taskData` (Object): 任務數據
  - `name` (string): 任務名稱
  - `display_name` (string): 顯示名稱
  - `replay_url` (string): Replay URL

**返回值:** `Promise<number>` - 任務ID

**範例:**
```javascript
const taskId = await db.createTask({
    name: 'developer_flow_mcp',
    display_name: 'Developer Flow MCP',
    replay_url: 'https://manus.im/share/...'
});
```

#### `async addMessage(taskId, messageData)`
添加消息記錄。

**參數:**
- `taskId` (number): 任務ID
- `messageData` (Object): 消息數據
  - `content` (string): 消息內容
  - `category` (string): 分類 ([思考]/[觀察]/[行動])
  - `source` (string): 來源 (user/manus/system)

**返回值:** `Promise<number>` - 消息ID

**範例:**
```javascript
const messageId = await db.addMessage(taskId, {
    content: '我認為這個方案可行',
    category: '思考',
    source: 'user'
});
```

#### `async addFile(taskId, fileData)`
添加文件記錄。

**參數:**
- `taskId` (number): 任務ID
- `fileData` (Object): 文件數據
  - `filename` (string): 文件名
  - `filepath` (string): 文件路徑
  - `file_type` (string): 文件類型
  - `file_category` (string): 文件分類

**返回值:** `Promise<number>` - 文件ID

**範例:**
```javascript
const fileId = await db.addFile(taskId, {
    filename: 'report.pdf',
    filepath: '/path/to/report.pdf',
    file_type: 'pdf',
    file_category: 'documents'
});
```

#### `async getTaskStats(taskId)`
獲取任務統計信息。

**參數:**
- `taskId` (number): 任務ID

**返回值:** `Promise<Object>` - 統計數據

**範例:**
```javascript
const stats = await db.getTaskStats(taskId);
// 返回: { messageCount: 50, fileCount: 10, categories: {...} }
```

## 🎯 ManusTaskManager 類

### 構造函數
```javascript
constructor(config, database)
```
**參數:**
- `config` (Object): 配置對象
- `database` (ManusDatabase): 數據庫實例

### 主要方法

#### `async init()`
初始化任務管理器，啟動瀏覽器。

**返回值:** `Promise<void>`

**範例:**
```javascript
const manager = new ManusTaskManager(config, db);
await manager.init();
```

#### `async navigateToStartPage()`
導航到起始頁面。

**返回值:** `Promise<void>`

#### `async getTaskList()`
獲取任務列表。

**返回值:** `Promise<Array<Object>>` - 任務列表

**範例:**
```javascript
const tasks = await manager.getTaskList();
// 返回: [{ name: 'Task 1', selector: '...' }, ...]
```

#### `async processTask(task, index, total)`
處理單個任務。

**參數:**
- `task` (Object): 任務對象
- `index` (number): 當前索引
- `total` (number): 總任務數

**返回值:** `Promise<Object>` - 處理結果

**範例:**
```javascript
const result = await manager.processTask(task, 0, 5);
```

#### `async getReplayUrl()`
獲取當前任務的replay URL。

**返回值:** `Promise<string>` - Replay URL

#### `async downloadTaskFiles(taskId, taskDir)`
下載任務相關文件。

**參數:**
- `taskId` (number): 任務ID
- `taskDir` (string): 任務目錄路徑

**返回值:** `Promise<Object>` - 下載結果

#### `async sendMessage(message)`
向當前任務發送消息。

**參數:**
- `message` (string): 消息內容

**返回值:** `Promise<boolean>` - 發送成功與否

## 🔤 工具函數

### `classifyMessage(content)`
對消息內容進行自動分類。

**參數:**
- `content` (string): 消息內容

**返回值:** `string` - 分類結果 ([思考]/[觀察]/[行動]/其他)

**範例:**
```javascript
const category = classifyMessage('我認為這個方案很好');
// 返回: '思考'
```

### `sanitizeTaskName(taskName)`
清理任務名稱，移除特殊字符。

**參數:**
- `taskName` (string): 原始任務名稱

**返回值:** `string` - 清理後的名稱

**範例:**
```javascript
const cleanName = sanitizeTaskName('Task #1: Test & Debug');
// 返回: 'Task_1_Test_Debug'
```

### `ensureDirectoryExists(dirPath)`
確保目錄存在，如不存在則創建。

**參數:**
- `dirPath` (string): 目錄路徑

**返回值:** `void`

**範例:**
```javascript
ensureDirectoryExists('/path/to/directory');
```

## 📊 配置對象

### CONFIG 結構
```javascript
const CONFIG = {
    // 基礎設置
    baseDir: '/home/alexchuang/manus',
    startUrl: 'https://manus.im/app/taskId',
    
    // 瀏覽器設置
    chromeExecutablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    
    // 數據庫設置
    dbPath: '/home/alexchuang/manus/manus_tasks.db',
    
    // 文件設置
    downloadsDir: '/Users/alexchuang/Downloads',
    
    // 消息設置
    defaultMessage: '🤖 自動化系統檢查...',
    
    // 時間設置
    waitTime: 3000,
    longWaitTime: 10000,
    retryAttempts: 3
};
```

### 文件類型配置
```javascript
const FILE_TYPES = {
    'Documents': 'documents',
    'Images': 'images',
    'Code files': 'code_files',
    'Links': 'links'
};
```

### 分類關鍵詞配置
```javascript
const CLASSIFICATION_KEYWORDS = {
    '思考': ['我認為', '分析', '考慮', ...],
    '觀察': ['我看到', '發現', '確認', ...],
    '行動': ['執行', '創建', '完成', ...]
};
```

## 🔄 事件和回調

### 任務處理事件
```javascript
// 任務開始處理
manager.on('taskStart', (task) => {
    console.log(`開始處理任務: ${task.name}`);
});

// 任務處理完成
manager.on('taskComplete', (task, result) => {
    console.log(`任務完成: ${task.name}`, result);
});

// 任務處理失敗
manager.on('taskError', (task, error) => {
    console.error(`任務失敗: ${task.name}`, error);
});
```

### 文件下載事件
```javascript
// 文件下載開始
manager.on('downloadStart', (fileType) => {
    console.log(`開始下載 ${fileType} 文件`);
});

// 文件下載完成
manager.on('downloadComplete', (fileType, count) => {
    console.log(`${fileType} 文件下載完成，共 ${count} 個`);
});
```

## 🚨 錯誤處理

### 錯誤類型

#### `DatabaseError`
數據庫相關錯誤。
```javascript
try {
    await db.addMessage(taskId, messageData);
} catch (error) {
    if (error instanceof DatabaseError) {
        console.error('數據庫錯誤:', error.message);
    }
}
```

#### `BrowserError`
瀏覽器操作錯誤。
```javascript
try {
    await manager.navigateToStartPage();
} catch (error) {
    if (error instanceof BrowserError) {
        console.error('瀏覽器錯誤:', error.message);
    }
}
```

#### `FileOperationError`
文件操作錯誤。
```javascript
try {
    await manager.downloadTaskFiles(taskId, taskDir);
} catch (error) {
    if (error instanceof FileOperationError) {
        console.error('文件操作錯誤:', error.message);
    }
}
```

### 錯誤恢復策略
```javascript
// 自動重試機制
async function retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

## 📈 性能監控

### 性能指標
```javascript
// 獲取性能統計
const stats = await manager.getPerformanceStats();
/*
返回:
{
    totalTasks: 10,
    averageProcessingTime: 45000,
    totalFiles: 50,
    totalMessages: 200,
    memoryUsage: { rss: 150000000, heapUsed: 80000000 }
}
*/
```

### 記憶體監控
```javascript
// 監控記憶體使用
manager.on('memoryWarning', (usage) => {
    console.warn('記憶體使用過高:', usage);
});
```

## 🔧 擴展和自定義

### 自定義消息分類器
```javascript
class CustomMessageClassifier {
    classify(content) {
        // 自定義分類邏輯
        if (content.includes('AI')) return 'AI相關';
        return classifyMessage(content);
    }
}

// 使用自定義分類器
manager.setMessageClassifier(new CustomMessageClassifier());
```

### 自定義文件處理器
```javascript
class CustomFileProcessor {
    async processFile(filePath, fileType) {
        // 自定義文件處理邏輯
        if (fileType === 'pdf') {
            return await this.extractPdfText(filePath);
        }
        return null;
    }
}
```

## 📋 最佳實踐

### 1. 錯誤處理
```javascript
// 總是使用 try-catch
try {
    await manager.processTask(task);
} catch (error) {
    console.error('處理失敗:', error);
    // 記錄錯誤到日誌
    logger.error('Task processing failed', { task, error });
}
```

### 2. 資源清理
```javascript
// 確保資源被正確清理
try {
    await manager.init();
    await manager.processAllTasks();
} finally {
    await manager.cleanup();
    await db.close();
}
```

### 3. 配置驗證
```javascript
// 驗證配置
function validateConfig(config) {
    const required = ['baseDir', 'startUrl', 'dbPath'];
    for (const key of required) {
        if (!config[key]) {
            throw new Error(`Missing required config: ${key}`);
        }
    }
}
```

## 🔍 調試和日誌

### 啟用調試模式
```javascript
// 設置環境變量
process.env.DEBUG = 'manus:*';

// 或在代碼中啟用
const manager = new ManusTaskManager(config, db);
manager.setDebugMode(true);
```

### 日誌級別
```javascript
// 設置日誌級別
manager.setLogLevel('debug'); // debug, info, warn, error
```

這份API文檔涵蓋了系統的所有主要功能和使用方法。如需更多詳細信息，請參考源代碼中的註釋。

