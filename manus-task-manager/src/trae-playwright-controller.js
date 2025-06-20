// Trae Playwright Controller - 統一的Trae自動化控制系統
// 替代所有AppleScript方法，使用現代化的Playwright解決方案

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Trae Playwright控制器
 * 統一管理所有Trae相關的自動化操作
 */
class TraePlaywrightController {
    constructor(config = {}) {
        this.config = {
            // 基本配置
            traeUrl: config.traeUrl || 'https://manus.im/app/',
            headless: config.headless !== undefined ? config.headless : false,
            timeout: config.timeout || 30000,
            waitTime: config.waitTime || 2000,
            
            // 瀏覽器配置
            chromeExecutablePath: config.chromeExecutablePath || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            viewport: config.viewport || { width: 1920, height: 1080 },
            
            // 選擇器配置
            selectors: {
                inputBox: config.selectors?.inputBox || 'textarea[placeholder*="輸入"], textarea[placeholder*="input"], [contenteditable="true"]',
                sendButton: config.selectors?.sendButton || 'button[type="submit"], button:has-text("發送"), button:has-text("Send")',
                messageContainer: config.selectors?.messageContainer || '.message, .chat-message, [data-message]',
                conversationHistory: config.selectors?.conversationHistory || '.conversation, .chat-history, .messages',
                shareButton: config.selectors?.shareButton || 'button:has-text("Share"), button:has-text("分享")',
                copyButton: config.selectors?.copyButton || 'button:has-text("Copy"), button:has-text("複製")'
            },
            
            // 輸出配置
            outputDir: config.outputDir || '/tmp/trae-playwright',
            logLevel: config.logLevel || 'info'
        };
        
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
        
        // 確保輸出目錄存在
        this.ensureDirectoryExists(this.config.outputDir);
    }

    /**
     * 初始化瀏覽器和頁面
     */
    async initialize() {
        try {
            this.log('🚀 初始化Trae Playwright控制器...');
            
            // 啟動瀏覽器
            this.browser = await chromium.launch({
                executablePath: this.config.chromeExecutablePath,
                headless: this.config.headless,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            // 創建新頁面
            this.page = await this.browser.newPage();
            await this.page.setViewportSize(this.config.viewport);
            
            // 設置超時時間
            this.page.setDefaultTimeout(this.config.timeout);
            
            this.isInitialized = true;
            this.log('✅ 瀏覽器初始化完成');
            
        } catch (error) {
            this.log(`❌ 初始化失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 導航到Trae頁面
     * @param {string} taskUrl - 特定任務的URL（可選）
     */
    async navigateToTrae(taskUrl = null) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const url = taskUrl || this.config.traeUrl;
            this.log(`🌐 導航到Trae頁面: ${url}`);
            
            await this.page.goto(url, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(this.config.waitTime);
            
            // 等待頁面加載完成
            await this.waitForPageLoad();
            
            this.log('✅ 頁面加載完成');
            
        } catch (error) {
            this.log(`❌ 導航失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 發送消息到Trae（替代trae-send）
     * @param {string} message - 要發送的消息
     * @param {Object} options - 發送選項
     */
    async sendMessage(message, options = {}) {
        try {
            this.log(`📝 準備發送消息: "${message}"`);
            
            // 智能查找輸入框
            const inputBox = await this.findInputBox();
            if (!inputBox) {
                throw new Error('無法找到輸入框');
            }

            // 清空輸入框並輸入消息
            await inputBox.clear();
            await inputBox.fill(message);
            await this.page.waitForTimeout(500);

            // 查找並點擊發送按鈕
            const sendButton = await this.findSendButton();
            if (sendButton) {
                await sendButton.click();
                this.log('✅ 通過發送按鈕發送消息');
            } else {
                // 如果沒有發送按鈕，嘗試按Enter鍵
                await inputBox.press('Enter');
                this.log('✅ 通過Enter鍵發送消息');
            }

            // 等待消息發送完成
            await this.page.waitForTimeout(this.config.waitTime);
            
            // 驗證消息是否發送成功
            const success = await this.verifyMessageSent(message);
            if (success) {
                this.log('✅ 消息發送成功');
                return { success: true, message: '消息發送成功' };
            } else {
                throw new Error('消息發送驗證失敗');
            }
            
        } catch (error) {
            this.log(`❌ 發送消息失敗: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 提取對話歷史（替代trae-history）
     * @param {Object} options - 提取選項
     */
    async extractHistory(options = {}) {
        try {
            this.log('📚 開始提取對話歷史...');
            
            // 等待對話歷史加載
            await this.waitForConversationLoad();
            
            // 滾動到頂部以加載所有歷史消息
            await this.scrollToLoadAllMessages();
            
            // 提取所有消息
            const messages = await this.extractAllMessages();
            
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
            this.log(`📁 保存到: ${outputFile}`);
            
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
     * 獲取分享鏈接（替代trae-sync的部分功能）
     * @param {Object} options - 獲取選項
     */
    async getShareLink(options = {}) {
        try {
            this.log('🔗 開始獲取分享鏈接...');
            
            // 查找分享按鈕
            const shareButton = await this.findShareButton();
            if (!shareButton) {
                throw new Error('無法找到分享按鈕');
            }

            // 點擊分享按鈕
            await shareButton.click();
            await this.page.waitForTimeout(1000);

            // 查找複製按鈕或鏈接
            const shareLink = await this.extractShareLink();
            
            if (shareLink) {
                this.log(`✅ 成功獲取分享鏈接: ${shareLink}`);
                return { success: true, shareLink: shareLink };
            } else {
                throw new Error('無法提取分享鏈接');
            }
            
        } catch (error) {
            this.log(`❌ 獲取分享鏈接失敗: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 智能查找輸入框
     */
    async findInputBox() {
        const selectors = [
            this.config.selectors.inputBox,
            'textarea',
            'input[type="text"]',
            '[contenteditable="true"]',
            '.input-box',
            '.message-input',
            '.chat-input'
        ];

        for (const selector of selectors) {
            try {
                const element = await this.page.$(selector);
                if (element && await element.isVisible()) {
                    this.log(`✅ 找到輸入框: ${selector}`);
                    return element;
                }
            } catch (error) {
                // 繼續嘗試下一個選擇器
            }
        }

        // 如果都找不到，嘗試通過座標定位（從之前的對話歷史中獲取）
        return await this.findInputBoxByCoordinates();
    }

    /**
     * 通過座標查找輸入框（備用方法）
     */
    async findInputBoxByCoordinates() {
        try {
            // 使用之前確認的座標 (1115, 702)
            const x = 1115;
            const y = 702;
            
            this.log(`🎯 嘗試通過座標定位輸入框: (${x}, ${y})`);
            
            // 點擊座標位置
            await this.page.click(`body`, { position: { x, y } });
            await this.page.waitForTimeout(500);
            
            // 檢查是否成功聚焦到輸入框
            const activeElement = await this.page.evaluateHandle(() => document.activeElement);
            const tagName = await activeElement.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'textarea' || tagName === 'input') {
                this.log('✅ 通過座標成功定位到輸入框');
                return activeElement;
            }
            
        } catch (error) {
            this.log(`❌ 座標定位失敗: ${error.message}`, 'error');
        }
        
        return null;
    }

    /**
     * 查找發送按鈕
     */
    async findSendButton() {
        const selectors = [
            this.config.selectors.sendButton,
            'button[type="submit"]',
            '.send-button',
            '.submit-button',
            'button:has-text("發送")',
            'button:has-text("Send")'
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

        // 嘗試通過座標定位發送按鈕 (1310, 702)
        return await this.findSendButtonByCoordinates();
    }

    /**
     * 通過座標查找發送按鈕
     */
    async findSendButtonByCoordinates() {
        try {
            const x = 1310;
            const y = 702;
            
            this.log(`🎯 嘗試通過座標定位發送按鈕: (${x}, ${y})`);
            
            // 檢查座標位置是否有可點擊元素
            const element = await this.page.elementHandle(`body`);
            return element; // 返回body元素，稍後通過座標點擊
            
        } catch (error) {
            this.log(`❌ 發送按鈕座標定位失敗: ${error.message}`, 'error');
        }
        
        return null;
    }

    /**
     * 查找分享按鈕
     */
    async findShareButton() {
        const selectors = [
            this.config.selectors.shareButton,
            'button:has-text("Share")',
            'button:has-text("分享")',
            '.share-button',
            '[data-action="share"]'
        ];

        for (const selector of selectors) {
            try {
                const element = await this.page.$(selector);
                if (element && await element.isVisible()) {
                    this.log(`✅ 找到分享按鈕: ${selector}`);
                    return element;
                }
            } catch (error) {
                // 繼續嘗試下一個選擇器
            }
        }

        return null;
    }

    /**
     * 等待頁面加載完成
     */
    async waitForPageLoad() {
        try {
            // 等待網絡空閒
            await this.page.waitForLoadState('networkidle');
            
            // 等待常見元素出現
            const commonSelectors = [
                'body',
                'main',
                '.app',
                '#app',
                '[data-app]'
            ];

            for (const selector of commonSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 5000 });
                    break;
                } catch (error) {
                    // 繼續嘗試下一個選擇器
                }
            }
            
        } catch (error) {
            this.log(`⚠️ 頁面加載等待超時: ${error.message}`, 'warn');
        }
    }

    /**
     * 等待對話加載完成
     */
    async waitForConversationLoad() {
        const selectors = [
            this.config.selectors.conversationHistory,
            '.messages',
            '.chat-history',
            '.conversation'
        ];

        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 10000 });
                this.log(`✅ 對話容器加載完成: ${selector}`);
                return;
            } catch (error) {
                // 繼續嘗試下一個選擇器
            }
        }

        this.log('⚠️ 未找到對話容器，使用默認等待時間', 'warn');
        await this.page.waitForTimeout(this.config.waitTime);
    }

    /**
     * 滾動加載所有消息
     */
    async scrollToLoadAllMessages() {
        this.log('📜 滾動加載所有歷史消息...');
        
        let previousHeight = 0;
        let currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
        
        while (previousHeight !== currentHeight) {
            previousHeight = currentHeight;
            
            // 滾動到頂部
            await this.page.evaluate(() => window.scrollTo(0, 0));
            await this.page.waitForTimeout(1000);
            
            // 滾動到底部
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await this.page.waitForTimeout(1000);
            
            currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
        }
        
        this.log('✅ 所有消息加載完成');
    }

    /**
     * 提取所有消息
     */
    async extractAllMessages() {
        const selectors = [
            this.config.selectors.messageContainer,
            '.message',
            '.chat-message',
            '[data-message]',
            '.conversation-item'
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
            '[data-timestamp]',
            '.message-time'
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
     * 提取分享鏈接
     */
    async extractShareLink() {
        try {
            // 嘗試從剪貼板獲取
            const clipboardText = await this.page.evaluate(async () => {
                try {
                    return await navigator.clipboard.readText();
                } catch (error) {
                    return null;
                }
            });

            if (clipboardText && clipboardText.includes('http')) {
                return clipboardText.trim();
            }

            // 嘗試從頁面元素獲取
            const linkSelectors = [
                'input[value*="http"]',
                '.share-link',
                '[data-share-url]'
            ];

            for (const selector of linkSelectors) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        const value = await element.getAttribute('value') || await element.textContent();
                        if (value && value.includes('http')) {
                            return value.trim();
                        }
                    }
                } catch (error) {
                    // 繼續嘗試
                }
            }

            return null;
        } catch (error) {
            this.log(`❌ 提取分享鏈接失敗: ${error.message}`, 'error');
            return null;
        }
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
                filename || `screenshot-${Date.now()}.png`
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
 * 便捷函數：發送消息
 */
async function sendMessageToTrae(message, config = {}) {
    const controller = new TraePlaywrightController(config);
    
    try {
        await controller.navigateToTrae(config.taskUrl);
        const result = await controller.sendMessage(message);
        return result;
    } finally {
        await controller.cleanup();
    }
}

/**
 * 便捷函數：提取歷史
 */
async function extractTraeHistory(config = {}) {
    const controller = new TraePlaywrightController(config);
    
    try {
        await controller.navigateToTrae(config.taskUrl);
        const result = await controller.extractHistory();
        return result;
    } finally {
        await controller.cleanup();
    }
}

/**
 * 便捷函數：獲取分享鏈接
 */
async function getTraeShareLink(config = {}) {
    const controller = new TraePlaywrightController(config);
    
    try {
        await controller.navigateToTrae(config.taskUrl);
        const result = await controller.getShareLink();
        return result;
    } finally {
        await controller.cleanup();
    }
}

module.exports = {
    TraePlaywrightController,
    sendMessageToTrae,
    extractTraeHistory,
    getTraeShareLink
};

