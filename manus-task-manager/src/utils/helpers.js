// Manus任務管理系統 - 工具函數庫

/**
 * 清理任務名稱，移除特殊字符並格式化
 * @param {string} taskName - 原始任務名稱
 * @returns {string} 清理後的任務名稱
 */
function sanitizeTaskName(taskName) {
    return taskName
        .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s]/g, '') // 移除特殊字符，保留中文
        .replace(/\s+/g, '_') // 空格替換為下劃線
        .trim()
        .substring(0, 50); // 限制長度
}

/**
 * 確保目錄存在，如不存在則創建
 * @param {string} dirPath - 目錄路徑
 */
function ensureDirectoryExists(dirPath) {
    const fs = require('fs');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dirPath}`);
    }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字節）
 * @returns {string} 格式化後的文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化時間持續
 * @param {number} milliseconds - 毫秒數
 * @returns {string} 格式化後的時間
 */
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}小時${minutes % 60}分${seconds % 60}秒`;
    } else if (minutes > 0) {
        return `${minutes}分${seconds % 60}秒`;
    } else {
        return `${seconds}秒`;
    }
}

/**
 * 生成唯一的文件名
 * @param {string} baseName - 基礎文件名
 * @param {string} extension - 文件擴展名
 * @returns {string} 唯一的文件名
 */
function generateUniqueFileName(baseName, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${timestamp}_${randomSuffix}.${extension}`;
}

/**
 * 延遲執行
 * @param {number} ms - 延遲毫秒數
 * @returns {Promise} Promise對象
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重試機制包裝器
 * @param {Function} operation - 要執行的操作
 * @param {number} maxRetries - 最大重試次數
 * @param {number} retryDelay - 重試間隔（毫秒）
 * @returns {Promise} 操作結果
 */
async function retryOperation(operation, maxRetries = 3, retryDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.warn(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
            
            if (attempt < maxRetries) {
                console.log(`⏳ Retrying in ${retryDelay}ms...`);
                await delay(retryDelay);
                retryDelay *= 1.5; // 指數退避
            }
        }
    }
    
    throw new Error(`Operation failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

/**
 * 安全的JSON解析
 * @param {string} jsonString - JSON字符串
 * @param {*} defaultValue - 解析失敗時的默認值
 * @returns {*} 解析結果或默認值
 */
function safeJsonParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn('JSON解析失敗:', error.message);
        return defaultValue;
    }
}

/**
 * 深度克隆對象
 * @param {*} obj - 要克隆的對象
 * @returns {*} 克隆後的對象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * 驗證URL格式
 * @param {string} url - 要驗證的URL
 * @returns {boolean} 是否為有效URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 提取文件擴展名
 * @param {string} filename - 文件名
 * @returns {string} 文件擴展名（小寫）
 */
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

/**
 * 檢查文件類型
 * @param {string} filename - 文件名
 * @returns {string} 文件類型分類
 */
function getFileCategory(filename) {
    const extension = getFileExtension(filename);
    
    const categories = {
        documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'],
        images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff'],
        code_files: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'php', 'rb', 'go', 'rs'],
        links: ['url', 'webloc', 'lnk']
    };
    
    for (const [category, extensions] of Object.entries(categories)) {
        if (extensions.includes(extension)) {
            return category;
        }
    }
    
    return 'other';
}

/**
 * 生成隨機字符串
 * @param {number} length - 字符串長度
 * @returns {string} 隨機字符串
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 計算字符串的MD5哈希值
 * @param {string} str - 輸入字符串
 * @returns {string} MD5哈希值
 */
function calculateMD5(str) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * 獲取當前時間戳字符串
 * @returns {string} 格式化的時間戳
 */
function getCurrentTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * 清理HTML標籤
 * @param {string} html - HTML字符串
 * @returns {string} 純文本
 */
function stripHtmlTags(html) {
    return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * 截斷文本
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大長度
 * @param {string} suffix - 截斷後綴
 * @returns {string} 截斷後的文本
 */
function truncateText(text, maxLength = 100, suffix = '...') {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 驗證電子郵件格式
 * @param {string} email - 電子郵件地址
 * @returns {boolean} 是否為有效郵件格式
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 獲取系統信息
 * @returns {Object} 系統信息對象
 */
function getSystemInfo() {
    const os = require('os');
    const process = require('process');
    
    return {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuCount: os.cpus().length,
        uptime: os.uptime()
    };
}

/**
 * 記憶體使用監控
 * @returns {Object} 記憶體使用信息
 */
function getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
        rss: formatFileSize(usage.rss),
        heapTotal: formatFileSize(usage.heapTotal),
        heapUsed: formatFileSize(usage.heapUsed),
        external: formatFileSize(usage.external),
        arrayBuffers: formatFileSize(usage.arrayBuffers)
    };
}

/**
 * 創建進度條
 * @param {number} current - 當前進度
 * @param {number} total - 總數
 * @param {number} width - 進度條寬度
 * @returns {string} 進度條字符串
 */
function createProgressBar(current, total, width = 20) {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percentage}% (${current}/${total})`;
}

module.exports = {
    sanitizeTaskName,
    ensureDirectoryExists,
    formatFileSize,
    formatDuration,
    generateUniqueFileName,
    delay,
    retryOperation,
    safeJsonParse,
    deepClone,
    isValidUrl,
    getFileExtension,
    getFileCategory,
    generateRandomString,
    calculateMD5,
    getCurrentTimestamp,
    stripHtmlTags,
    truncateText,
    isValidEmail,
    getSystemInfo,
    getMemoryUsage,
    createProgressBar
};

