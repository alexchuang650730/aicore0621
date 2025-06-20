// Trae Playwright控制器 - 使用範例

const { TraePlaywrightController, sendMessageToTrae, extractTraeHistory, getTraeShareLink } = require('../src/trae-playwright-controller');

/**
 * 基本使用範例
 */
async function basicExample() {
    console.log('🎯 Trae Playwright控制器 - 基本使用範例');
    console.log('==========================================\n');

    const config = {
        traeUrl: 'https://manus.im/app/example-task',
        headless: false,  // 顯示瀏覽器窗口以便觀察
        timeout: 30000,
        waitTime: 2000,
        outputDir: '/tmp/trae-example'
    };

    const controller = new TraePlaywrightController(config);

    try {
        // 1. 導航到Trae頁面
        console.log('🌐 導航到Trae頁面...');
        await controller.navigateToTrae();

        // 2. 發送測試消息
        console.log('📝 發送測試消息...');
        const sendResult = await controller.sendMessage('這是一個Playwright測試消息');
        console.log('發送結果:', sendResult);

        // 3. 等待一下讓消息顯示
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 4. 提取對話歷史
        console.log('📚 提取對話歷史...');
        const historyResult = await controller.extractHistory();
        console.log(`歷史提取結果: ${historyResult.totalCount} 條消息`);

        // 5. 嘗試獲取分享鏈接
        console.log('🔗 獲取分享鏈接...');
        const shareResult = await controller.getShareLink();
        console.log('分享鏈接結果:', shareResult);

        // 6. 截圖保存
        console.log('📸 保存截圖...');
        await controller.takeScreenshot('example-final.png');

    } catch (error) {
        console.error('❌ 範例執行失敗:', error.message);
        await controller.takeScreenshot('example-error.png');
    } finally {
        await controller.cleanup();
    }
}

/**
 * 便捷函數使用範例
 */
async function convenienceFunctionExample() {
    console.log('\n🚀 便捷函數使用範例');
    console.log('====================\n');

    const config = {
        taskUrl: 'https://manus.im/app/example-task',
        headless: true,  // 無頭模式運行
        outputDir: '/tmp/trae-convenience'
    };

    try {
        // 1. 發送消息
        console.log('📝 使用便捷函數發送消息...');
        const sendResult = await sendMessageToTrae('便捷函數測試消息', config);
        console.log('發送結果:', sendResult);

        // 2. 提取歷史
        console.log('📚 使用便捷函數提取歷史...');
        const historyResult = await extractTraeHistory(config);
        console.log(`歷史結果: ${historyResult.totalCount} 條消息`);

        // 3. 獲取分享鏈接
        console.log('🔗 使用便捷函數獲取分享鏈接...');
        const shareResult = await getTraeShareLink(config);
        console.log('分享結果:', shareResult);

    } catch (error) {
        console.error('❌ 便捷函數範例失敗:', error.message);
    }
}

/**
 * 批量操作範例
 */
async function batchOperationExample() {
    console.log('\n📦 批量操作範例');
    console.log('================\n');

    const config = {
        traeUrl: 'https://manus.im/app/example-task',
        headless: true,
        timeout: 30000,
        outputDir: '/tmp/trae-batch'
    };

    const controller = new TraePlaywrightController(config);
    const messages = [
        '批量消息 1: 這是第一條測試消息',
        '批量消息 2: 這是第二條測試消息',
        '批量消息 3: 這是第三條測試消息'
    ];

    try {
        await controller.navigateToTrae();

        console.log(`📝 準備發送 ${messages.length} 條消息...`);
        
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            console.log(`發送消息 ${i + 1}/${messages.length}: "${message}"`);
            
            const result = await controller.sendMessage(message);
            if (result.success) {
                console.log(`✅ 消息 ${i + 1} 發送成功`);
            } else {
                console.log(`❌ 消息 ${i + 1} 發送失敗: ${result.error}`);
            }
            
            // 消息間等待
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 最後提取所有歷史
        console.log('📚 提取完整對話歷史...');
        const historyResult = await controller.extractHistory();
        console.log(`✅ 批量操作完成，共處理 ${historyResult.totalCount} 條消息`);

    } catch (error) {
        console.error('❌ 批量操作失敗:', error.message);
    } finally {
        await controller.cleanup();
    }
}

/**
 * 錯誤處理範例
 */
async function errorHandlingExample() {
    console.log('\n🚨 錯誤處理範例');
    console.log('================\n');

    const config = {
        traeUrl: 'https://invalid-url.com',  // 故意使用無效URL
        headless: true,
        timeout: 5000  // 較短的超時時間
    };

    const controller = new TraePlaywrightController(config);

    try {
        console.log('🧪 測試無效URL處理...');
        await controller.navigateToTrae();
    } catch (error) {
        console.log('✅ 成功捕獲導航錯誤:', error.message);
    }

    try {
        console.log('🧪 測試未初始化狀態下發送消息...');
        await controller.sendMessage('測試消息');
    } catch (error) {
        console.log('✅ 成功捕獲未初始化錯誤:', error.message);
    }

    await controller.cleanup();
}

/**
 * 配置測試範例
 */
async function configurationExample() {
    console.log('\n⚙️ 配置測試範例');
    console.log('================\n');

    // 測試不同的配置組合
    const configs = [
        {
            name: '默認配置',
            config: {}
        },
        {
            name: '無頭模式配置',
            config: {
                headless: true,
                timeout: 15000
            }
        },
        {
            name: '自定義選擇器配置',
            config: {
                selectors: {
                    inputBox: 'textarea, input[type="text"]',
                    sendButton: 'button[type="submit"]'
                }
            }
        }
    ];

    for (const { name, config } of configs) {
        console.log(`🔧 測試配置: ${name}`);
        
        const controller = new TraePlaywrightController({
            ...config,
            traeUrl: 'https://example.com',  // 使用簡單的測試頁面
            timeout: 5000
        });

        try {
            await controller.initialize();
            console.log(`✅ ${name} 初始化成功`);
        } catch (error) {
            console.log(`❌ ${name} 初始化失敗: ${error.message}`);
        } finally {
            await controller.cleanup();
        }
    }
}

/**
 * 性能測試範例
 */
async function performanceExample() {
    console.log('\n⚡ 性能測試範例');
    console.log('================\n');

    const config = {
        traeUrl: 'https://example.com',
        headless: true,
        timeout: 10000
    };

    console.log('📊 測試初始化性能...');
    const startTime = Date.now();
    
    const controller = new TraePlaywrightController(config);
    
    try {
        await controller.initialize();
        const initTime = Date.now() - startTime;
        console.log(`✅ 初始化耗時: ${initTime}ms`);

        const navStartTime = Date.now();
        await controller.navigateToTrae();
        const navTime = Date.now() - navStartTime;
        console.log(`✅ 導航耗時: ${navTime}ms`);

        const screenshotStartTime = Date.now();
        await controller.takeScreenshot('performance-test.png');
        const screenshotTime = Date.now() - screenshotStartTime;
        console.log(`✅ 截圖耗時: ${screenshotTime}ms`);

        const totalTime = Date.now() - startTime;
        console.log(`📈 總耗時: ${totalTime}ms`);

    } catch (error) {
        console.error('❌ 性能測試失敗:', error.message);
    } finally {
        await controller.cleanup();
    }
}

/**
 * 主函數
 */
async function main() {
    console.log('🎯 Trae Playwright控制器範例集合');
    console.log('==================================\n');

    try {
        // 運行所有範例
        await basicExample();
        await convenienceFunctionExample();
        await batchOperationExample();
        await errorHandlingExample();
        await configurationExample();
        await performanceExample();

        console.log('\n🎉 所有範例執行完成！');
        console.log('\n📚 更多信息請查看:');
        console.log('  - docs/trae-playwright-guide.md: 完整使用指南');
        console.log('  - src/trae-cli.js: 命令行工具');
        console.log('  - src/trae-playwright-controller.js: 核心控制器');

    } catch (error) {
        console.error('❌ 範例執行過程中出錯:', error.message);
    }
}

// 如果直接運行此文件，執行主函數
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 程序執行失敗:', error);
        process.exit(1);
    });
}

module.exports = {
    basicExample,
    convenienceFunctionExample,
    batchOperationExample,
    errorHandlingExample,
    configurationExample,
    performanceExample
};

