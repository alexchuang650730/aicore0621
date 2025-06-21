// Trae VS Code插件控制器
// 專門用於控制VS Code中的Trae插件

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Trae VS Code插件控制器
 * 用於自動化控制VS Code中的Trae插件
 */
class TraeVSCodeController {
    constructor(config = {}) {
        this.config = {
            // VS Code配置
            vscodeExecutablePath: config.vscodeExecutablePath || this.getDefaultVSCodePath(),
            workspaceDir: config.workspaceDir || process.cwd(),
            
            // 瀏覽器配置（用於控制VS Code的Electron界面）
            headless: config.headless !== undefined ? config.headless : false,
            timeout: config.timeout || 30000,
            waitTime: config.waitTime || 2000,
            
            // Trae插件選擇器
            selectors: {
                // Trae面板
                traePanel: config.selectors?.traePanel || '[data-view-id="trae"]',
                traeSidebar: config.selectors?.traeSidebar || '.sidebar-pane-header:has-text("Trae")',
                
                // 輸入框和按鈕
                inputBox: config.selectors?.inputBox || 'textarea[placeholder*="輸入"], input[type="text"], .input-box',
                sendButton: config.selectors?.sendButton || 'button[title*="發送"], button[title*="Send"], .send-button',
                
                // 對話元素
                messageContainer: config.selectors?.messageContainer || '.message, .chat-message, .conversation-item',
                userMessage: config.selectors?.userMessage || '.user-message, .message.user',
                assistantMessage: config.selectors?.assistantMessage || '.assistant-message, .message.assistant',
                
                // VS Code元素
                activityBar: config.selectors?.activityBar || '.activitybar',
                sidebar: config.selectors?.sidebar || '.sidebar',
                editorArea: config.selectors?.editorArea || '.editor-container'
            },
            
            // 輸出配置
            outputDir: config.outputDir || '/tmp/trae-vscode',
            logLevel: config.logLevel || 'info'
        };
        
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
        
        // 確保輸出目錄存在
        this.ensureDirectoryExists(this.config.outputDir);
    }

    /**
     * 獲取默認VS Code路徑
     */
    getDefaultVSCodePath() {
        const os = require('os');
        const platform = os.platform();
        
        switch (platform) {
            case 'darwin': // macOS
                return '/Applications/Visual Studio Code.app/Contents/MacOS/Electron';
            case 'linux':
                const possiblePaths = [
                    '/usr/bin/code',
                    '/usr/local/bin/code',
                    '/snap/bin/code',
                    '/opt/visual-studio-code/bin/code'
                ];
                
                for (const path of possiblePaths) {
                    if (fs.existsSync(path)) {
                        return path;
                    }
                }
                return 'code'; // 假設在PATH中
            case 'win32': // Windows
                return 'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe';
            default:
                return 'code';
        }
    }

    /**
     * 初始化控制器
     */
    async initialize() {
        try {
            this.log('🚀 初始化Trae VS Code控制器...');
            
            // 啟動VS Code
            await this.launchVSCode();
            
            // 等待VS Code完全加載
            await this.waitForVSCodeLoad();
            
            // 確保Trae插件面板打開
            await this.ensureTraePanelOpen();
            
            this.isInitialized = true;
            this.log('✅ VS Code和Trae插件初始化完成');
            
        } catch (error) {
            this.log(`❌ 初始化失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 啟動VS Code
     */
    async launchVSCode() {
        this.log('📂 啟動VS Code...');
        
        // 使用Playwright連接到VS Code的Electron界面
        // 注意：這需要VS Code以特殊模式啟動以允許遠程調試
        
        // 方法1: 嘗試連接到已運行的VS Code
        try {
            this.browser = await chromium.connectOverCDP('http://localhost:9222');
            const contexts = this.browser.contexts();
            if (contexts.length > 0) {
                this.page = contexts[0].pages()[0] || await contexts[0].newPage();
                this.log('✅ 連接到現有VS Code實例');
                return;
            }
        } catch (error) {
            this.log('⚠️ 無法連接到現有VS Code，嘗試啟動新實例', 'warn');
        }
        
        // 方法2: 啟動新的VS Code實例（需要特殊參數）
        const { spawn } = require('child_process');
        
        const vscodeArgs = [
            '--remote-debugging-port=9222',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            this.config.workspaceDir
        ];
        
        this.log(`🔧 啟動VS Code: ${this.config.vscodeExecutablePath} ${vscodeArgs.join(' ')}`);
        
        const vscodeProcess = spawn(this.config.vscodeExecutablePath, vscodeArgs, {
            detached: true,
            stdio: 'ignore'
        });
        
        // 等待VS Code啟動
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 連接到VS Code
        try {
            this.browser = await chromium.connectOverCDP('http://localhost:9222');
            const contexts = this.browser.contexts();
            this.page = contexts[0].pages()[0] || await contexts[0].newPage();
            this.log('✅ 成功連接到新啟動的VS Code');
        } catch (error) {
            throw new Error(`無法連接到VS Code: ${error.message}`);
        }
    }

    /**
     * 等待VS Code完全加載
     */
    async waitForVSCodeLoad() {
        this.log('⏳ 等待VS Code完全加載...');
        
        // 等待VS Code的主要元素出現
        const mainSelectors = [
            this.config.selectors.activityBar,
            this.config.selectors.sidebar,
            this.config.selectors.editorArea
        ];
        
        for (const selector of mainSelectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 10000 });
                this.log(`✅ 找到VS Code元素: ${selector}`);
            } catch (error) {
                this.log(`⚠️ 未找到VS Code元素: ${selector}`, 'warn');
            }
        }
        
        // 額外等待時間確保完全加載
        await this.page.waitForTimeout(this.config.waitTime);
    }

    /**
     * 確保Trae插件面板打開
     */
    async ensureTraePanelOpen() {
        this.log('🔍 檢查Trae插件面板...');
        
        // 檢查Trae面板是否已經可見
        const traePanel = await this.page.$(this.config.selectors.traePanel);
        if (traePanel && await traePanel.isVisible()) {
            this.log('✅ Trae面板已經打開');
            return;
        }
        
        // 嘗試通過活動欄打開Trae
        try {
            // 查找Trae圖標或按鈕
            const traeButton = await this.page.$('button[title*="Trae"], .activity-bar-badge:has-text("Trae")');
            if (traeButton) {
                await traeButton.click();
                await this.page.waitForTimeout(1000);
                this.log('✅ 通過活動欄打開Trae面板');
                return;
            }
        } catch (error) {
            this.log('⚠️ 無法通過活動欄打開Trae', 'warn');
        }
        
        // 嘗試使用命令面板
        try {
            // 打開命令面板 (Cmd+Shift+P 或 Ctrl+Shift+P)
            await this.page.keyboard.press('Meta+Shift+KeyP'); // macOS
            await this.page.waitForTimeout(500);
            
            // 輸入Trae命令
            await this.page.keyboard.type('Trae');
            await this.page.waitForTimeout(500);
            
            // 按Enter執行
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(1000);
            
            this.log('✅ 通過命令面板打開Trae');
        } catch (error) {
            this.log('⚠️ 無法通過命令面板打開Trae', 'warn');
        }
    }

    /**
     * 發送消息到Trae
     */
    async sendMessage(message, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            this.log(`📝 準備發送消息到Trae: "${message}"`);
            
            // 確保Trae面板可見
            await this.ensureTraePanelOpen();
            
            // 查找輸入框
            const inputBox = await this.findTraeInputBox();
            if (!inputBox) {
                throw new Error('無法找到Trae輸入框');
            }
            
            // 清空並輸入消息
            await inputBox.click();
            await this.page.keyboard.press('Meta+A'); // 全選
            await inputBox.fill(message);
            await this.page.waitForTimeout(500);
            
            // 查找並點擊發送按鈕
            const sendButton = await this.findTraeSendButton();
            if (sendButton) {
                await sendButton.click();
                this.log('✅ 通過發送按鈕發送消息');
            } else {
                // 嘗試按Enter發送
                await this.page.keyboard.press('Enter');
                this.log('✅ 通過Enter鍵發送消息');
            }
            
            // 等待消息發送完成
            await this.page.waitForTimeout(this.config.waitTime);
            
            // 驗證消息是否發送成功
            const success = await this.verifyMessageSent(message);
            
            return {
                success: success,
                message: success ? '消息發送成功' : '消息發送可能失敗'
            };
            
        } catch (error) {
            this.log(`❌ 發送消息失敗: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 提取Trae對話歷史
     */
    async extractHistory(options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            this.log('📚 開始提取Trae對話歷史...');
            
            // 確保Trae面板可見
            await this.ensureTraePanelOpen();
            
            // 滾動到對話頂部以加載所有歷史
            await this.scrollToLoadAllMessages();
            
            // 提取所有消息
            const messages = await this.extractAllTraeMessages();
            
            // 分類消息
            const categorizedMessages = this.categorizeMessages(messages);
            
            // 保存到文件
            const outputFile = path.join(this.config.outputDir, `trae-history-${Date.now()}.json`);
            await this.saveToFile(outputFile, {
                timestamp: new Date().toISOString(),
                totalMessages: messages.length,
                categorized: categorizedMessages,
                raw: messages
            });
            
            this.log(`✅ 對話歷史提取完成，共 ${messages.length} 條消息`);
            
            return {
                success: true,
                messages: categorizedMessages,
                totalCount: messages.length,
                outputFile: outputFile
            };
            
        } catch (error) {
            this.log(`❌ 提取對話歷史失敗: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 查找Trae輸入框
     */
    async findTraeInputBox() {
        const selectors = [
            this.config.selectors.inputBox,
            'textarea',
            'input[type="text"]',
            '.monaco-inputbox input',
            '.input-container input',
            '.chat-input textarea'
        ];
        
        for (const selector of selectors) {
            try {
                const element = await this.page.$(selector);
                if (element && await element.isVisible()) {
                    this.log(`✅ 找到Trae輸入框: ${selector}`);
                    return element;
                }
            } catch (error) {
                // 繼續嘗試下一個選擇器
            }
        }
        
        // 如果都找不到，嘗試通過位置定位
        return await this.findInputBoxByPosition();
    }

    /**
     * 通過位置查找輸入框
     */
    async findInputBoxByPosition() {
        try {
            this.log('🎯 嘗試通過位置定位輸入框...');
            
            // 獲取頁面尺寸
            const viewport = await this.page.viewportSize();
            
            // 假設輸入框在右下角區域
            const x = viewport.width * 0.85; // 右側85%位置
            const y = viewport.height * 0.9;  // 底部90%位置
            
            // 點擊該位置
            await this.page.click('body', { position: { x, y } });
            await this.page.waitForTimeout(500);
            
            // 檢查是否成功聚焦到輸入元素
            const activeElement = await this.page.evaluateHandle(() => document.activeElement);
            const tagName = await activeElement.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'textarea' || tagName === 'input') {
                this.log('✅ 通過位置成功定位到輸入框');
                return activeElement;
            }
            
        } catch (error) {
            this.log(`❌ 位置定位失敗: ${error.message}`, 'error');
        }
        
        return null;
    }

    /**
     * 查找Trae發送按鈕
     */
    async findTraeSendButton() {
        const selectors = [
            this.config.selectors.sendButton,
            'button[title*="發送"]',
            'button[title*="Send"]',
            '.send-button',
            'button:has-text("發送")',
            'button[type="submit"]'
        ];
        
        for (const selector of selectors) {
            try {
                const element = await this.page.$(selector);
                if (element && await element.isVisible()) {
                    this.log(`✅ 找到發送按鈕: ${selector}`);
                    return element;
                }
            } catch (error) {
                // 繼續嘗試下一個選擇器
            }
        }
        
        return null;
    }

    /**
     * 滾動加載所有消息
     */
    async scrollToLoadAllMessages() {
        this.log('📜 滾動加載所有歷史消息...');
        
        // 查找對話容器
        const messageContainer = await this.page.$(this.config.selectors.messageContainer);
        if (!messageContainer) {
            this.log('⚠️ 未找到消息容器', 'warn');
            return;
        }
        
        // 滾動到頂部
        await messageContainer.evaluate(el => el.scrollTop = 0);
        await this.page.waitForTimeout(1000);
        
        // 滾動到底部
        await messageContainer.evaluate(el => el.scrollTop = el.scrollHeight);
        await this.page.waitForTimeout(1000);
    }

    /**
     * 提取所有Trae消息
     */
    async extractAllTraeMessages() {
        const selectors = [
            this.config.selectors.messageContainer,
            '.message',
            '.chat-message',
            '.conversation-item',
            '.monaco-list-row'
        ];
        
        let messages = [];
        
        for (const selector of selectors) {
            try {
                const elements = await this.page.$$(selector);
                if (elements.length > 0) {
                    this.log(`✅ 使用選擇器提取消息: ${selector} (${elements.length}條)`);
                    
                    for (const element of elements) {
                        const messageData = await this.extractMessageData(element);
                        if (messageData) {
                            messages.push(messageData);
                        }
                    }
                    break;
                }
            } catch (error) {
                // 繼續嘗試下一個選擇器
            }
        }
        
        return messages;
    }

    /**
     * 提取單個消息數據
     */
    async extractMessageData(element) {
        try {
            const text = await element.textContent();
            const timestamp = await this.extractTimestamp(element);
            const sender = await this.extractSender(element);
            
            return {
                text: text?.trim(),
                timestamp: timestamp,
                sender: sender,
                extractedAt: new Date().toISOString()
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * 提取時間戳
     */
    async extractTimestamp(element) {
        const timestampSelectors = [
            '.timestamp',
            '.time',
            '.message-time',
            '[data-timestamp]'
        ];
        
        for (const selector of timestampSelectors) {
            try {
                const timestampElement = await element.$(selector);
                if (timestampElement) {
                    return await timestampElement.textContent();
                }
            } catch (error) {
                // 繼續嘗試
            }
        }
        
        return null;
    }

    /**
     * 提取發送者
     */
    async extractSender(element) {
        const senderSelectors = [
            '.sender',
            '.author',
            '.username',
            '.user-name',
            '[data-sender]'
        ];
        
        for (const selector of senderSelectors) {
            try {
                const senderElement = await element.$(selector);
                if (senderElement) {
                    return await senderElement.textContent();
                }
            } catch (error) {
                // 繼續嘗試
            }
        }
        
        // 嘗試通過CSS類判斷
        const className = await element.getAttribute('class') || '';
        if (className.includes('user')) {
            return 'user';
        } else if (className.includes('assistant') || className.includes('ai')) {
            return 'assistant';
        }
        
        return 'unknown';
    }

    /**
     * 分類消息
     */
    categorizeMessages(messages) {
        const categories = {
            '思考': [],
            '觀察': [],
            '行動': [],
            '其他': []
        };
        
        const keywords = {
            '思考': ['分析', '考慮', '評估', '判斷', '推理', '計劃', '策略', '設計', '我認為', '我覺得', '我想'],
            '觀察': ['發現', '注意到', '觀察', '檢測', '識別', '確認', '檢查', '監測', '我看到', '顯示', '出現'],
            '行動': ['執行', '運行', '創建', '修改', '實施', '完成', '操作', '處理', '發送', '點擊', '開始']
        };
        
        messages.forEach(message => {
            let category = '其他';
            let maxScore = 0;
            
            for (const [cat, keywordList] of Object.entries(keywords)) {
                let score = 0;
                keywordList.forEach(keyword => {
                    if (message.text && message.text.includes(keyword)) {
                        score++;
                    }
                });
                
                if (score > maxScore) {
                    maxScore = score;
                    category = cat;
                }
            }
            
            categories[category].push(message);
        });
        
        return categories;
    }

    /**
     * 驗證消息是否發送成功
     */
    async verifyMessageSent(message) {
        try {
            await this.page.waitForTimeout(2000);
            
            // 檢查頁面上是否出現了發送的消息
            const messageExists = await this.page.evaluate((msg) => {
                return document.body.textContent.includes(msg);
            }, message);
            
            return messageExists;
        } catch (error) {
            return false;
        }
    }

    /**
     * 保存數據到文件
     */
    async saveToFile(filePath, data) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            await fs.promises.writeFile(filePath, jsonData, 'utf8');
            this.log(`✅ 數據已保存到: ${filePath}`);
        } catch (error) {
            this.log(`❌ 保存文件失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 確保目錄存在
     */
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * 日誌記錄
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '📋',
            'warn': '⚠️',
            'error': '❌',
            'success': '✅'
        }[level] || '📋';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    /**
     * 截圖（調試用）
     */
    async takeScreenshot(filename = null) {
        if (!this.page) return null;
        
        try {
            const screenshotPath = path.join(
                this.config.outputDir,
                filename || `vscode-screenshot-${Date.now()}.png`
            );
            
            await this.page.screenshot({
                path: screenshotPath,
                fullPage: true
            });
            
            this.log(`📸 截圖已保存: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            this.log(`❌ 截圖失敗: ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * 清理資源
     */
    async cleanup() {
        try {
            if (this.page) {
                await this.page.close();
                this.page = null;
            }
            
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            
            this.isInitialized = false;
            this.log('✅ 資源清理完成');
        } catch (error) {
            this.log(`❌ 清理資源失敗: ${error.message}`, 'error');
        }
    }
}

/**
 * 便捷函數：發送消息到Trae
 */
async function sendMessageToTrae(message, config = {}) {
    const controller = new TraeVSCodeController(config);
    
    try {
        const result = await controller.sendMessage(message);
        return result;
    } finally {
        await controller.cleanup();
    }
}

/**
 * 便捷函數：提取Trae歷史
 */
async function extractTraeHistory(config = {}) {
    const controller = new TraeVSCodeController(config);
    
    try {
        const result = await controller.extractHistory();
        return result;
    } finally {
        await controller.cleanup();
    }
}

module.exports = {
    TraeVSCodeController,
    sendMessageToTrae,
    extractTraeHistory
};

