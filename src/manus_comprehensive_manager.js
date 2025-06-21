const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 配置
const CONFIG = {
    baseDir: '/home/alexchuang/manus',
    startUrl: 'https://manus.im/app/uuX3KzwzsthCSgqmbQbgOz', // 起始任務URL
    chromeExecutablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    dbPath: '/home/alexchuang/manus/manus_tasks.db',
    downloadsDir: '/Users/alexchuang/Downloads',
    // 可配置的消息內容
    defaultMessage: '🤖 自動化系統檢查：請確認任務狀態和進度。如有需要，請提供最新的更新信息。',
    waitTime: 3000 // 操作間等待時間（毫秒）
};

// 文件類型配置
const FILE_TYPES = {
    'Documents': 'documents',
    'Images': 'images', 
    'Code files': 'code_files',
    'Links': 'links'
};

// 消息分類關鍵詞
const CLASSIFICATION_KEYWORDS = {
    '思考': [
        '我認為', '我覺得', '分析', '考慮', '思考', '判斷', '評估', '推理', 
        '計劃', '策略', '假設', '推測', '預測', '設想', '構思', '規劃'
    ],
    '觀察': [
        '我看到', '發現', '注意到', '觀察', '檢測', '顯示', '出現', '結果',
        '確認意圖', '確認', '理解', '明白', '了解', '識別', '檢查', '察覺',
        '監測', '記錄', '報告', '狀態', '情況'
    ],
    '行動': [
        '執行', '運行', '創建', '修改', '發送', '點擊', '操作', '實施', 
        '完成', '開始', '啟動', '停止', '刪除', '更新', '安裝', '配置',
        '部署', '測試', '調試', '優化'
    ]
};

// 工具函數
function sanitizeTaskName(taskName) {
    return taskName
        .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
}

function classifyMessage(content) {
    const text = content.toLowerCase();
    let scores = { '思考': 0, '觀察': 0, '行動': 0 };
    
    for (const [category, keywords] of Object.entries(CLASSIFICATION_KEYWORDS)) {
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                scores[category] += 1;
            }
        }
    }
    
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return '其他';
    
    return Object.keys(scores).find(key => scores[key] === maxScore);
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dirPath}`);
    }
}

// 數據庫類
class ManusDatabase {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }
    
    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                display_name TEXT,
                replay_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )`,
            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                content TEXT NOT NULL,
                category TEXT DEFAULT '其他',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                source TEXT DEFAULT 'unknown',
                message_type TEXT DEFAULT 'text',
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            )`,
            `CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                file_type TEXT,
                file_category TEXT,
                file_size INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            )`,
            `CREATE TABLE IF NOT EXISTS task_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                session_type TEXT,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME,
                messages_collected INTEGER DEFAULT 0,
                files_downloaded INTEGER DEFAULT 0,
                messages_sent INTEGER DEFAULT 0,
                status TEXT DEFAULT 'running',
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            )`
        ];
        
        for (const sql of tables) {
            await this.run(sql);
        }
        console.log('✅ Database tables created/verified');
    }
    
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }
    
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
    
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
    
    async createOrGetTask(taskName, displayName = null, replayUrl = null) {
        try {
            let task = await this.get('SELECT * FROM tasks WHERE name = ?', [taskName]);
            
            if (!task) {
                const result = await this.run(
                    'INSERT INTO tasks (name, display_name, replay_url) VALUES (?, ?, ?)',
                    [taskName, displayName || taskName, replayUrl]
                );
                task = await this.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
                console.log(`✅ Created new task: ${taskName}`);
            } else {
                await this.run(
                    'UPDATE tasks SET last_updated = CURRENT_TIMESTAMP, replay_url = COALESCE(?, replay_url) WHERE id = ?',
                    [replayUrl, task.id]
                );
            }
            
            return task;
        } catch (error) {
            console.error('❌ Error creating/getting task:', error);
            throw error;
        }
    }
    
    async addMessage(taskId, content, source = 'unknown', messageType = 'text') {
        try {
            const category = classifyMessage(content);
            const result = await this.run(
                'INSERT INTO messages (task_id, content, category, source, message_type) VALUES (?, ?, ?, ?, ?)',
                [taskId, content, category, source, messageType]
            );
            
            console.log(`✅ Added message [${category}]: ${content.substring(0, 50)}...`);
            return result.id;
        } catch (error) {
            console.error('❌ Error adding message:', error);
            throw error;
        }
    }
    
    async addFile(taskId, filename, filepath, fileType = null, fileCategory = null, fileSize = null) {
        try {
            const result = await this.run(
                'INSERT INTO files (task_id, filename, filepath, file_type, file_category, file_size) VALUES (?, ?, ?, ?, ?, ?)',
                [taskId, filename, filepath, fileType, fileCategory, fileSize]
            );
            
            console.log(`✅ Added file record [${fileCategory}]: ${filename}`);
            return result.id;
        } catch (error) {
            console.error('❌ Error adding file:', error);
            throw error;
        }
    }
    
    async createSession(taskId, sessionType) {
        try {
            const result = await this.run(
                'INSERT INTO task_sessions (task_id, session_type) VALUES (?, ?)',
                [taskId, sessionType]
            );
            return result.id;
        } catch (error) {
            console.error('❌ Error creating session:', error);
            throw error;
        }
    }
    
    async updateSession(sessionId, updates) {
        try {
            const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(sessionId);
            
            await this.run(
                `UPDATE task_sessions SET ${setClause} WHERE id = ?`,
                values
            );
        } catch (error) {
            console.error('❌ Error updating session:', error);
            throw error;
        }
    }
    
    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) console.error('❌ Error closing database:', err);
                    else console.log('✅ Database connection closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// 任務管理器類
class ManusTaskManager {
    constructor(config, database) {
        this.config = config;
        this.db = database;
        this.browser = null;
        this.page = null;
        this.currentSession = null;
    }
    
    async init() {
        console.log('🚀 Starting Manus Comprehensive Task Manager...');
        
        // 確保基礎目錄存在
        ensureDirectoryExists(this.config.baseDir);
        
        // 啟動瀏覽器
        this.browser = await chromium.launch({
            executablePath: this.config.chromeExecutablePath,
            headless: false,
            args: [
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        this.page = await context.newPage();

        // 移除webdriver標識
        await this.page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        console.log('✅ Browser initialized successfully');
    }
    
    async navigateToStartPage() {
        console.log(`📱 Navigating to ${this.config.startUrl}`);
        await this.page.goto(this.config.startUrl, { waitUntil: 'networkidle' });
        
        // 等待Manus應用完全加載
        console.log('⏳ Waiting for Manus application to load...');
        await this.page.waitForFunction(() => {
            return document.title === 'Manus' && 
                   !document.body.textContent.includes('Sign in') &&
                   !document.body.textContent.includes('Sign up');
        }, { timeout: 30000 });
        
        console.log('✅ Manus application loaded successfully!');
        await this.page.waitForTimeout(this.config.waitTime);
    }
    
    async getTaskList() {
        console.log('🔍 Discovering task list...');
        
        try {
            // 等待任務列表加載
            await this.page.waitForTimeout(2000);
            
            // 嘗試找到任務列表元素
            const taskElements = await this.page.locator('[role="button"], .task-item, [data-testid*="task"], a[href*="/app/"]').all();
            
            const tasks = [];
            for (let i = 0; i < Math.min(taskElements.length, 20); i++) { // 限制最多20個任務
                try {
                    const element = taskElements[i];
                    const text = await element.textContent();
                    
                    if (text && text.trim().length > 3 && text.trim().length < 100) {
                        tasks.push({
                            element: element,
                            name: text.trim(),
                            index: i
                        });
                    }
                } catch (e) {
                    // 忽略無法訪問的元素
                }
            }
            
            console.log(`✅ Found ${tasks.length} potential tasks`);
            return tasks;
            
        } catch (error) {
            console.error('❌ Error discovering tasks:', error);
            return [];
        }
    }
    
    async processTask(task, taskIndex, totalTasks) {
        console.log(`\n📋 Processing Task ${taskIndex + 1}/${totalTasks}: "${task.name}"`);
        
        const taskName = sanitizeTaskName(task.name);
        const taskDir = path.join(this.config.baseDir, taskName);
        
        // 創建任務目錄結構
        ensureDirectoryExists(taskDir);
        ensureDirectoryExists(path.join(taskDir, 'history'));
        ensureDirectoryExists(path.join(taskDir, 'doc'));
        
        // 為每種文件類型創建子目錄
        Object.values(FILE_TYPES).forEach(subDir => {
            ensureDirectoryExists(path.join(taskDir, 'doc', subDir));
        });
        
        // 在數據庫中創建或獲取任務
        const dbTask = await this.db.createOrGetTask(taskName, task.name);
        
        // 創建會話記錄
        const sessionId = await this.db.createSession(dbTask.id, 'full_processing');
        this.currentSession = sessionId;
        
        let messagesCollected = 0;
        let filesDownloaded = 0;
        let messagesSent = 0;
        
        try {
            // 點擊任務進入詳情頁
            console.log('👆 Clicking task to enter details...');
            await task.element.click();
            await this.page.waitForTimeout(this.config.waitTime);
            
            // 1. 獲取Replay URL和對話歷史
            const replayUrl = await this.getReplayUrl();
            if (replayUrl) {
                await this.db.run('UPDATE tasks SET replay_url = ? WHERE id = ?', [replayUrl, dbTask.id]);
                messagesCollected = await this.extractConversationHistory(replayUrl, dbTask.id);
            }
            
            // 2. 下載分類文件
            filesDownloaded = await this.downloadTaskFiles(dbTask.id, taskDir);
            
            // 3. 發送消息
            messagesSent = await this.sendMessageToTask(dbTask.id);
            
            // 更新會話記錄
            await this.db.updateSession(sessionId, {
                end_time: new Date().toISOString(),
                messages_collected: messagesCollected,
                files_downloaded: filesDownloaded,
                messages_sent: messagesSent,
                status: 'completed'
            });
            
            console.log(`✅ Task "${task.name}" processed successfully!`);
            console.log(`   📊 Messages: ${messagesCollected}, Files: ${filesDownloaded}, Sent: ${messagesSent}`);
            
        } catch (error) {
            console.error(`❌ Error processing task "${task.name}":`, error);
            
            await this.db.updateSession(sessionId, {
                end_time: new Date().toISOString(),
                status: 'error'
            });
        }
        
        // 等待一段時間再處理下一個任務
        await this.page.waitForTimeout(this.config.waitTime);
    }
    
    async getReplayUrl() {
        console.log('🔗 Getting replay URL...');
        
        try {
            // 尋找並點擊Share按鈕
            const shareSelectors = [
                'button[aria-label*="Share"]',
                'button[title*="Share"]',
                'text=Share',
                '[data-testid*="share"]'
            ];
            
            let shareButton = null;
            for (const selector of shareSelectors) {
                try {
                    shareButton = this.page.locator(selector).first();
                    await shareButton.waitFor({ state: 'visible', timeout: 3000 });
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!shareButton) {
                console.log('❌ Share button not found');
                return null;
            }
            
            await shareButton.click();
            console.log('✅ Share button clicked');
            await this.page.waitForTimeout(1000);
            
            // 等待分享對話框出現並點擊Copy link
            try {
                const copyLinkButton = this.page.locator('text=Copy link').first();
                await copyLinkButton.waitFor({ state: 'visible', timeout: 5000 });
                await copyLinkButton.click();
                console.log('✅ Copy link button clicked');
                
                // 等待一下讓剪貼板操作完成
                await this.page.waitForTimeout(1000);
                
                // 嘗試從剪貼板讀取URL
                const replayUrl = await this.page.evaluate(async () => {
                    try {
                        return await navigator.clipboard.readText();
                    } catch (e) {
                        return null;
                    }
                });
                
                if (replayUrl && replayUrl.includes('manus.im/share')) {
                    console.log(`✅ Got replay URL: ${replayUrl}`);
                    
                    // 關閉分享對話框
                    await this.page.keyboard.press('Escape');
                    return replayUrl;
                } else {
                    console.log('❌ Failed to get valid replay URL from clipboard');
                    return null;
                }
                
            } catch (e) {
                console.log('❌ Failed to click Copy link button:', e.message);
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error getting replay URL:', error);
            return null;
        }
    }
    
    async extractConversationHistory(replayUrl, taskId) {
        console.log('📜 Extracting conversation history from replay...');
        
        try {
            // 在新標籤頁中打開replay URL
            const replayPage = await this.browser.newPage();
            await replayPage.goto(replayUrl, { waitUntil: 'networkidle' });
            await replayPage.waitForTimeout(3000);
            
            // 提取對話內容
            const allText = await replayPage.textContent('body');
            const lines = allText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 10 && line.length < 2000)
                .filter(line => !line.includes('css') && !line.includes('rgb') && !line.includes('px'));
            
            let messageCount = 0;
            for (const line of lines) {
                if (line.includes('Manus') || line.includes('您') || line.includes('我') || 
                    line.includes('Hello') || line.includes('請') || line.includes('可以') ||
                    line.includes('分析') || line.includes('執行') || line.includes('觀察') ||
                    line.includes('思考') || line.includes('建議') || line.includes('完成')) {
                    
                    await this.db.addMessage(taskId, line, 'replay_extracted', 'conversation');
                    messageCount++;
                }
            }
            
            await replayPage.close();
            console.log(`✅ Extracted ${messageCount} messages from replay`);
            return messageCount;
            
        } catch (error) {
            console.error('❌ Error extracting conversation history:', error);
            return 0;
        }
    }
    
    async downloadTaskFiles(taskId, taskDir) {
        console.log('📁 Downloading task files...');
        
        let totalFilesDownloaded = 0;
        
        try {
            // 尋找並點擊文件按鈕（Share右邊的按鈕）
            const fileButtonSelectors = [
                'button[aria-label*="files"]',
                'button[title*="files"]',
                'button[aria-label*="View all files"]',
                '[data-testid*="files"]'
            ];
            
            let fileButton = null;
            for (const selector of fileButtonSelectors) {
                try {
                    fileButton = this.page.locator(selector).first();
                    await fileButton.waitFor({ state: 'visible', timeout: 3000 });
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!fileButton) {
                console.log('❌ File button not found');
                return 0;
            }
            
            await fileButton.click();
            console.log('✅ File button clicked');
            await this.page.waitForTimeout(2000);
            
            // 等待文件對話框出現
            await this.page.waitForSelector('text=All files in this task', { timeout: 5000 });
            
            // 對每種文件類型進行下載
            for (const [displayName, dirName] of Object.entries(FILE_TYPES)) {
                console.log(`📂 Processing ${displayName} files...`);
                
                try {
                    // 點擊文件類型標籤
                    const typeTab = this.page.locator(`text=${displayName}`).first();
                    await typeTab.click();
                    await this.page.waitForTimeout(1000);
                    
                    // 檢查是否有文件
                    const hasFiles = await this.page.locator('.file-item, [data-testid*="file"]').count() > 0;
                    
                    if (hasFiles) {
                        // 點擊Batch download
                        const batchDownloadButton = this.page.locator('text=Batch download').first();
                        await batchDownloadButton.click();
                        console.log(`✅ Started batch download for ${displayName}`);
                        
                        // 等待下載完成
                        await this.page.waitForTimeout(5000);
                        
                        // 移動下載的文件到對應目錄
                        const movedFiles = await this.moveDownloadedFiles(taskDir, dirName);
                        totalFilesDownloaded += movedFiles;
                        
                        // 記錄文件到數據庫
                        await this.recordDownloadedFiles(taskId, taskDir, dirName, displayName);
                        
                    } else {
                        console.log(`ℹ️ No ${displayName} files found`);
                    }
                    
                } catch (e) {
                    console.log(`⚠️ Error processing ${displayName} files:`, e.message);
                }
            }
            
            // 關閉文件對話框
            await this.page.keyboard.press('Escape');
            
        } catch (error) {
            console.error('❌ Error downloading files:', error);
        }
        
        console.log(`✅ Downloaded ${totalFilesDownloaded} files total`);
        return totalFilesDownloaded;
    }
    
    async moveDownloadedFiles(taskDir, fileCategory) {
        try {
            const downloadsDir = this.config.downloadsDir;
            const targetDir = path.join(taskDir, 'doc', fileCategory);
            
            if (!fs.existsSync(downloadsDir)) {
                return 0;
            }
            
            const files = fs.readdirSync(downloadsDir);
            let movedCount = 0;
            
            for (const file of files) {
                const sourcePath = path.join(downloadsDir, file);
                const targetPath = path.join(targetDir, file);
                
                try {
                    // 檢查文件是否是最近下載的（5分鐘內）
                    const stats = fs.statSync(sourcePath);
                    const now = new Date();
                    const fileTime = new Date(stats.mtime);
                    const diffMinutes = (now - fileTime) / (1000 * 60);
                    
                    if (diffMinutes <= 5) {
                        fs.renameSync(sourcePath, targetPath);
                        console.log(`✅ Moved file: ${file} → ${fileCategory}/`);
                        movedCount++;
                    }
                } catch (e) {
                    console.log(`⚠️ Failed to move file ${file}:`, e.message);
                }
            }
            
            return movedCount;
        } catch (error) {
            console.error('❌ Error moving downloaded files:', error);
            return 0;
        }
    }
    
    async recordDownloadedFiles(taskId, taskDir, fileCategory, displayName) {
        try {
            const categoryDir = path.join(taskDir, 'doc', fileCategory);
            
            if (!fs.existsSync(categoryDir)) {
                return;
            }
            
            const files = fs.readdirSync(categoryDir);
            
            for (const file of files) {
                const filePath = path.join(categoryDir, file);
                const stats = fs.statSync(filePath);
                
                await this.db.addFile(
                    taskId,
                    file,
                    filePath,
                    path.extname(file),
                    displayName,
                    stats.size
                );
            }
        } catch (error) {
            console.error('❌ Error recording downloaded files:', error);
        }
    }
    
    async sendMessageToTask(taskId) {
        console.log('💬 Sending message to task...');
        
        try {
            // 尋找輸入框
            const inputSelectors = [
                'textarea[placeholder*="發送消息給 Manus"]',
                'textarea[placeholder*="Send message to Manus"]',
                'textarea[placeholder*="發送消息給"]',
                'textarea[placeholder*="Manus"]',
                'textarea[placeholder*="Send message"]',
                'textarea[placeholder*="message"]',
                'div[contenteditable="true"]',
                'input[type="text"]',
                'textarea'
            ];
            
            let inputElement = null;
            for (const selector of inputSelectors) {
                try {
                    inputElement = this.page.locator(selector).first();
                    await inputElement.waitFor({ state: 'visible', timeout: 3000 });
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!inputElement) {
                console.log('❌ Input box not found');
                return 0;
            }
            
            // 準備消息內容
            const timestamp = new Date().toLocaleString('zh-TW');
            const message = `${this.config.defaultMessage}\n\n⏰ 發送時間: ${timestamp}`;
            
            // 點擊輸入框並輸入消息
            await inputElement.click();
            await this.page.waitForTimeout(500);
            await inputElement.fill(message);
            console.log(`✅ Message typed: "${message.substring(0, 50)}..."`);
            
            // 記錄發送的消息到數據庫
            await this.db.addMessage(taskId, message, 'automation_system', 'outgoing');
            
            // 嘗試發送消息
            const sendSelectors = [
                'button[aria-label*="Send"]',
                'button[title*="Send"]',
                'button[aria-label*="發送"]',
                'button[title*="發送"]',
                'button:has(svg)',
                '[data-testid*="send"]',
                'button[type="submit"]'
            ];
            
            let sendButtonFound = false;
            for (const selector of sendSelectors) {
                try {
                    const sendButton = this.page.locator(selector).first();
                    await sendButton.waitFor({ state: 'visible', timeout: 2000 });
                    await sendButton.click();
                    console.log(`✅ Send button clicked: ${selector}`);
                    sendButtonFound = true;
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!sendButtonFound) {
                console.log('⌨️ No send button found, trying Enter key...');
                await inputElement.press('Enter');
                console.log('✅ Pressed Enter to send');
            }
            
            // 等待消息發送完成
            await this.page.waitForTimeout(2000);
            
            console.log('✅ Message sent successfully');
            return 1;
            
        } catch (error) {
            console.error('❌ Error sending message:', error);
            return 0;
        }
    }
    
    async generateFinalReport() {
        console.log('📊 Generating final report...');
        
        try {
            const tasks = await this.db.all('SELECT * FROM tasks ORDER BY last_updated DESC');
            const totalMessages = await this.db.get('SELECT COUNT(*) as count FROM messages');
            const totalFiles = await this.db.get('SELECT COUNT(*) as count FROM files');
            const sessions = await this.db.all('SELECT * FROM task_sessions ORDER BY start_time DESC');
            
            const reportPath = path.join(this.config.baseDir, `manus_comprehensive_report_${new Date().toISOString().slice(0, 10)}.txt`);
            
            const report = `
Manus 綜合任務管理系統報告
========================
生成時間: ${new Date().toLocaleString('zh-TW')}
數據庫: ${this.config.dbPath}

📊 總體統計:
- 處理任務數: ${tasks.length}
- 收集消息數: ${totalMessages.count}
- 下載文件數: ${totalFiles.count}
- 執行會話數: ${sessions.length}

📋 任務詳情:
${tasks.map((task, index) => `
${index + 1}. ${task.display_name}
   - 任務ID: ${task.id}
   - 創建時間: ${task.created_at}
   - 最後更新: ${task.last_updated}
   - Replay URL: ${task.replay_url || '未獲取'}
   - 狀態: ${task.status}
`).join('')}

🔧 系統功能:
✅ 任務列表自動遍歷
✅ Replay URL自動獲取
✅ 對話歷史智能分類 [思考][觀察][行動]
✅ 四類文件分類下載 (Documents/Images/Code files/Links)
✅ 自動消息發送
✅ SQLite數據庫完整記錄
✅ 目錄結構自動組織

📁 目錄結構:
${this.config.baseDir}/
├── manus_tasks.db (SQLite數據庫)
├── taskxxx/
│   ├── history/ (對話歷史)
│   └── doc/
│       ├── documents/
│       ├── images/
│       ├── code_files/
│       └── links/
└── 各任務目錄...

🎯 系統狀態: ✅ 運行完成
            `;
            
            fs.writeFileSync(reportPath, report, 'utf8');
            console.log(`📋 Final report saved: ${reportPath}`);
            
        } catch (error) {
            console.error('❌ Error generating final report:', error);
        }
    }
    
    async cleanup() {
        console.log('🧹 Cleaning up...');
        
        if (this.browser) {
            await this.browser.close();
            console.log('✅ Browser closed');
        }
    }
}

// 主程序
(async () => {
    let db;
    let taskManager;
    
    try {
        console.log('🚀 Starting Manus Comprehensive Task Management System...');
        
        // 初始化數據庫
        db = new ManusDatabase(CONFIG.dbPath);
        await db.init();
        
        // 初始化任務管理器
        taskManager = new ManusTaskManager(CONFIG, db);
        await taskManager.init();
        
        // 導航到起始頁面
        await taskManager.navigateToStartPage();
        
        // 獲取任務列表
        const tasks = await taskManager.getTaskList();
        
        if (tasks.length === 0) {
            console.log('❌ No tasks found to process');
            return;
        }
        
        console.log(`\n🎯 Found ${tasks.length} tasks to process`);
        
        // 處理每個任務
        for (let i = 0; i < tasks.length; i++) {
            await taskManager.processTask(tasks[i], i, tasks.length);
            
            // 每處理3個任務後稍作休息
            if ((i + 1) % 3 === 0) {
                console.log('😴 Taking a short break...');
                await taskManager.page.waitForTimeout(5000);
            }
        }
        
        // 生成最終報告
        await taskManager.generateFinalReport();
        
        console.log('\n🎉 Manus Comprehensive Task Management System completed successfully!');
        console.log(`📁 All data saved to: ${CONFIG.baseDir}`);
        console.log(`🗄️ Database location: ${CONFIG.dbPath}`);
        
        // 保持瀏覽器開啟一段時間以便觀察
        console.log('🔍 Keeping browser open for 30 seconds for observation...');
        await taskManager.page.waitForTimeout(30000);
        
    } catch (error) {
        console.error(`❌ An unexpected error occurred: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
    } finally {
        if (taskManager) {
            await taskManager.cleanup();
        }
        if (db) {
            await db.close();
        }
        console.log('👋 Manus Comprehensive Task Management System finished.');
    }
})();

