// Manus任務管理系統 - 配置範例
// 複製此文件為 config.js 並根據您的環境進行調整

module.exports = {
    // ==================== 基礎設置 ====================
    
    // 數據存儲基礎目錄
    baseDir: '/home/您的用戶名/manus',
    
    // Manus任務起始URL (替換為您的實際任務URL)
    startUrl: 'https://manus.im/app/您的任務ID',
    
    // ==================== 瀏覽器設置 ====================
    
    // Chrome瀏覽器執行路徑
    // macOS:
    chromeExecutablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    
    // Ubuntu/Linux:
    // chromeExecutablePath: '/usr/bin/google-chrome',
    
    // Windows:
    // chromeExecutablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    
    // 瀏覽器啟動參數
    browserArgs: [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox'
    ],
    
    // 是否以無頭模式運行 (true = 不顯示瀏覽器窗口)
    headless: false,
    
    // ==================== 數據庫設置 ====================
    
    // SQLite數據庫文件路徑
    dbPath: '/home/您的用戶名/manus/manus_tasks.db',
    
    // 數據庫連接選項
    dbOptions: {
        verbose: console.log // 設為 null 關閉SQL日誌
    },
    
    // ==================== 文件管理設置 ====================
    
    // 瀏覽器下載目錄
    downloadsDir: '/Users/您的用戶名/Downloads',
    
    // 支持的文件類型映射
    fileTypes: {
        'Documents': 'documents',
        'Images': 'images',
        'Code files': 'code_files',
        'Links': 'links'
    },
    
    // 文件大小限制 (bytes)
    maxFileSize: 100 * 1024 * 1024, // 100MB
    
    // ==================== 消息設置 ====================
    
    // 默認發送的消息內容
    defaultMessage: '🤖 自動化系統檢查：請確認任務狀態和進度。如有需要，請提供最新的更新信息。',
    
    // 是否自動發送消息
    autoSendMessage: true,
    
    // 消息發送間隔 (毫秒)
    messageSendInterval: 5000,
    
    // ==================== 時間設置 ====================
    
    // 基本等待時間 (毫秒)
    waitTime: 3000,
    
    // 長等待時間 (毫秒)
    longWaitTime: 10000,
    
    // 頁面加載超時時間 (毫秒)
    pageTimeout: 30000,
    
    // 元素等待超時時間 (毫秒)
    elementTimeout: 10000,
    
    // ==================== 重試設置 ====================
    
    // 操作重試次數
    retryAttempts: 3,
    
    // 重試間隔 (毫秒)
    retryDelay: 2000,
    
    // 網路請求重試次數
    networkRetries: 5,
    
    // ==================== 性能設置 ====================
    
    // 批量處理大小
    batchSize: 3,
    
    // 並行處理數量
    maxConcurrency: 2,
    
    // 記憶體使用警告閾值 (bytes)
    memoryWarningThreshold: 500 * 1024 * 1024, // 500MB
    
    // ==================== 日誌設置 ====================
    
    // 日誌級別: 'debug', 'info', 'warn', 'error'
    logLevel: 'info',
    
    // 是否保存日誌到文件
    saveLogsToFile: true,
    
    // 日誌文件路徑
    logFilePath: '/home/您的用戶名/manus/logs/manus.log',
    
    // 日誌輪轉大小 (bytes)
    logRotationSize: 10 * 1024 * 1024, // 10MB
    
    // ==================== 安全設置 ====================
    
    // 是否驗證SSL證書
    ignoreHTTPSErrors: false,
    
    // 用戶代理字符串
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // 請求頭設置
    extraHTTPHeaders: {
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
    },
    
    // ==================== 代理設置 ====================
    
    // HTTP代理設置 (可選)
    proxy: {
        // server: 'http://proxy-server:port',
        // username: 'proxy-username',
        // password: 'proxy-password'
    },
    
    // ==================== 調試設置 ====================
    
    // 是否啟用調試模式
    debugMode: false,
    
    // 是否保存截圖
    saveScreenshots: true,
    
    // 截圖保存目錄
    screenshotDir: '/home/您的用戶名/manus/screenshots',
    
    // 是否在錯誤時保存頁面HTML
    savePageOnError: true,
    
    // ==================== 通知設置 ====================
    
    // 是否啟用通知
    enableNotifications: false,
    
    // 通知方式: 'email', 'webhook', 'console'
    notificationMethod: 'console',
    
    // 電子郵件通知設置
    emailNotification: {
        // smtp: 'smtp.gmail.com',
        // port: 587,
        // username: 'your-email@gmail.com',
        // password: 'your-app-password',
        // to: 'recipient@example.com'
    },
    
    // Webhook通知設置
    webhookNotification: {
        // url: 'https://hooks.slack.com/services/...',
        // method: 'POST',
        // headers: { 'Content-Type': 'application/json' }
    },
    
    // ==================== 實驗性功能 ====================
    
    // 是否啟用實驗性功能
    enableExperimentalFeatures: false,
    
    // 機器學習分類 (實驗性)
    enableMLClassification: false,
    
    // 自動任務發現 (實驗性)
    enableAutoTaskDiscovery: false,
    
    // 實時同步 (實驗性)
    enableRealTimeSync: false
};

// ==================== 環境特定配置 ====================

// 開發環境配置
if (process.env.NODE_ENV === 'development') {
    module.exports.debugMode = true;
    module.exports.logLevel = 'debug';
    module.exports.saveScreenshots = true;
    module.exports.headless = false;
}

// 生產環境配置
if (process.env.NODE_ENV === 'production') {
    module.exports.debugMode = false;
    module.exports.logLevel = 'warn';
    module.exports.saveScreenshots = false;
    module.exports.headless = true;
}

// 測試環境配置
if (process.env.NODE_ENV === 'test') {
    module.exports.dbPath = ':memory:'; // 使用內存數據庫
    module.exports.headless = true;
    module.exports.waitTime = 1000; // 加快測試速度
}

