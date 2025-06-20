// Manus任務管理系統 - 基本使用範例

const { chromium } = require('playwright');
const path = require('path');

// 引入系統模塊
const { ManusDatabase } = require('../src/database');
const { MessageClassifier } = require('../src/utils/classifier');
const { sanitizeTaskName, ensureDirectoryExists } = require('../src/utils/helpers');

/**
 * 基本使用範例
 * 演示如何使用Manus任務管理系統的核心功能
 */
async function basicUsageExample() {
    console.log('🚀 Manus任務管理系統 - 基本使用範例');
    console.log('=====================================\n');

    // 1. 配置設置
    const config = {
        baseDir: '/tmp/manus-example',
        dbPath: '/tmp/manus-example/example.db',
        startUrl: 'https://manus.im/app/example-task-id',
        chromeExecutablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        waitTime: 2000
    };

    // 確保目錄存在
    ensureDirectoryExists(config.baseDir);

    let db = null;
    let browser = null;

    try {
        // 2. 初始化數據庫
        console.log('📊 初始化數據庫...');
        db = new ManusDatabase(config.dbPath);
        await db.init();
        console.log('✅ 數據庫初始化完成\n');

        // 3. 創建消息分類器
        console.log('🤖 初始化消息分類器...');
        const classifier = new MessageClassifier();
        console.log('✅ 分類器初始化完成\n');

        // 4. 演示消息分類功能
        console.log('📝 演示消息分類功能:');
        const testMessages = [
            '我認為這個方案很有潜力',
            '我看到系統顯示了錯誤信息',
            '請執行數據備份操作',
            '今天天氣不錯'
        ];

        testMessages.forEach(message => {
            const category = classifier.classify(message);
            const analysis = classifier.analyzeDetailed(message);
            console.log(`  消息: "${message}"`);
            console.log(`  分類: ${category} (信心度: ${analysis.confidence})`);
            console.log(`  匹配關鍵詞: ${analysis.matchedKeywords.map(k => k.keyword).join(', ')}\n`);
        });

        // 5. 創建示例任務
        console.log('📋 創建示例任務...');
        const taskId = await db.createTask({
            name: 'example_task',
            display_name: '範例任務',
            replay_url: 'https://manus.im/share/example-replay-url'
        });
        console.log(`✅ 任務創建完成，ID: ${taskId}\n`);

        // 6. 添加示例消息
        console.log('💬 添加示例消息...');
        for (const message of testMessages) {
            const category = classifier.classify(message);
            await db.addMessage(taskId, {
                content: message,
                category: category,
                source: 'example'
            });
        }
        console.log('✅ 消息添加完成\n');

        // 7. 添加示例文件記錄
        console.log('📁 添加示例文件記錄...');
        const exampleFiles = [
            { filename: 'report.pdf', file_type: 'pdf', file_category: 'documents' },
            { filename: 'screenshot.png', file_type: 'png', file_category: 'images' },
            { filename: 'script.js', file_type: 'js', file_category: 'code_files' }
        ];

        for (const file of exampleFiles) {
            await db.addFile(taskId, {
                ...file,
                filepath: path.join(config.baseDir, 'files', file.filename),
                file_size: Math.floor(Math.random() * 1000000) // 隨機文件大小
            });
        }
        console.log('✅ 文件記錄添加完成\n');

        // 8. 查詢和統計
        console.log('📊 查詢任務統計信息...');
        const stats = await db.getTaskStats(taskId);
        console.log('任務統計:');
        console.log(`  總消息數: ${stats.messageCount}`);
        console.log(`  總文件數: ${stats.fileCount}`);
        console.log('  消息分類統計:');
        Object.entries(stats.categories).forEach(([category, count]) => {
            console.log(`    ${category}: ${count}`);
        });
        console.log();

        // 9. 演示瀏覽器自動化（簡化版）
        console.log('🌐 演示瀏覽器自動化...');
        browser = await chromium.launch({
            executablePath: config.chromeExecutablePath,
            headless: true // 無頭模式，不顯示瀏覽器窗口
        });

        const page = await browser.newPage();
        
        // 訪問一個測試頁面
        await page.goto('https://example.com');
        await page.waitForTimeout(config.waitTime);
        
        // 獲取頁面標題
        const title = await page.title();
        console.log(`✅ 成功訪問頁面: ${title}\n`);

        // 10. 生成簡單報告
        console.log('📋 生成處理報告...');
        const report = {
            timestamp: new Date().toISOString(),
            taskId: taskId,
            processedMessages: testMessages.length,
            processedFiles: exampleFiles.length,
            categories: stats.categories,
            status: 'completed'
        };

        console.log('處理報告:');
        console.log(JSON.stringify(report, null, 2));

    } catch (error) {
        console.error('❌ 範例執行失敗:', error.message);
        console.error('詳細錯誤:', error.stack);
    } finally {
        // 11. 清理資源
        console.log('\n🧹 清理資源...');
        
        if (browser) {
            await browser.close();
            console.log('✅ 瀏覽器已關閉');
        }
        
        if (db) {
            await db.close();
            console.log('✅ 數據庫連接已關閉');
        }
        
        console.log('✅ 資源清理完成');
    }
}

/**
 * 演示錯誤處理
 */
async function errorHandlingExample() {
    console.log('\n🚨 錯誤處理範例');
    console.log('==================\n');

    try {
        // 故意創建一個錯誤情況
        const invalidDb = new ManusDatabase('/invalid/path/database.db');
        await invalidDb.init();
    } catch (error) {
        console.log('✅ 成功捕獲數據庫錯誤:', error.message);
    }

    try {
        // 故意使用無效的瀏覽器路徑
        const browser = await chromium.launch({
            executablePath: '/invalid/chrome/path'
        });
    } catch (error) {
        console.log('✅ 成功捕獲瀏覽器錯誤:', error.message);
    }
}

/**
 * 演示配置驗證
 */
function configValidationExample() {
    console.log('\n⚙️ 配置驗證範例');
    console.log('==================\n');

    const configs = [
        { name: '完整配置', config: { baseDir: '/tmp', dbPath: '/tmp/db.db', startUrl: 'https://example.com' } },
        { name: '缺少baseDir', config: { dbPath: '/tmp/db.db', startUrl: 'https://example.com' } },
        { name: '無效URL', config: { baseDir: '/tmp', dbPath: '/tmp/db.db', startUrl: 'invalid-url' } }
    ];

    configs.forEach(({ name, config }) => {
        console.log(`測試配置: ${name}`);
        try {
            validateConfig(config);
            console.log('✅ 配置驗證通過\n');
        } catch (error) {
            console.log(`❌ 配置驗證失敗: ${error.message}\n`);
        }
    });
}

/**
 * 配置驗證函數
 */
function validateConfig(config) {
    const required = ['baseDir', 'dbPath', 'startUrl'];
    
    for (const key of required) {
        if (!config[key]) {
            throw new Error(`缺少必需的配置項: ${key}`);
        }
    }
    
    // 驗證URL格式
    try {
        new URL(config.startUrl);
    } catch (error) {
        throw new Error(`無效的URL格式: ${config.startUrl}`);
    }
}

// 主函數
async function main() {
    console.log('🎯 Manus任務管理系統範例集合');
    console.log('================================\n');

    // 運行各種範例
    await basicUsageExample();
    await errorHandlingExample();
    configValidationExample();

    console.log('\n🎉 所有範例執行完成！');
    console.log('\n📚 更多範例請查看:');
    console.log('  - single-task.js: 單個任務處理');
    console.log('  - batch-processing.js: 批量處理');
    console.log('  - custom-classifier.js: 自定義分類器');
    console.log('  - file-management.js: 文件管理');
}

// 如果直接運行此文件，執行主函數
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 範例執行失敗:', error);
        process.exit(1);
    });
}

module.exports = {
    basicUsageExample,
    errorHandlingExample,
    configValidationExample,
    validateConfig
};

