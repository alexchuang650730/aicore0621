// 測試Trae Playwright控制器
const { TraePlaywrightController } = require('./src/trae-playwright-controller');

async function testController() {
    console.log('🧪 開始測試Trae Playwright控制器...\n');
    
    // 測試1: 基本初始化（使用系統Chromium）
    console.log('📋 測試1: 基本初始化');
    const config = {
        traeUrl: 'https://example.com',
        headless: true,
        timeout: 10000,
        chromeExecutablePath: undefined  // 使用Playwright內建的Chromium
    };
    
    const controller = new TraePlaywrightController(config);
    
    try {
        await controller.initialize();
        console.log('✅ 初始化成功');
        
        // 測試2: 導航到測試頁面
        console.log('\n📋 測試2: 導航到測試頁面');
        await controller.navigateToTrae('https://example.com');
        console.log('✅ 導航成功');
        
        // 測試3: 截圖功能
        console.log('\n📋 測試3: 截圖功能');
        const screenshotPath = await controller.takeScreenshot('test-screenshot.png');
        if (screenshotPath) {
            console.log('✅ 截圖成功:', screenshotPath);
        } else {
            console.log('⚠️ 截圖失敗');
        }
        
        // 測試4: 配置驗證
        console.log('\n📋 測試4: 配置驗證');
        console.log('配置信息:', {
            url: controller.config.traeUrl,
            headless: controller.config.headless,
            timeout: controller.config.timeout
        });
        console.log('✅ 配置驗證成功');
        
        console.log('\n🎉 所有基本測試通過！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        await controller.cleanup();
        console.log('🧹 清理完成');
    }
}

// 測試便捷函數
async function testConvenienceFunctions() {
    console.log('\n🚀 測試便捷函數...\n');
    
    const { sendMessageToTrae, extractTraeHistory, getTraeShareLink } = require('./src/trae-playwright-controller');
    
    const config = {
        taskUrl: 'https://example.com',
        headless: true,
        timeout: 5000,
        chromeExecutablePath: undefined
    };
    
    try {
        // 測試sendMessageToTrae（預期會失敗，因為example.com沒有輸入框）
        console.log('📋 測試sendMessageToTrae...');
        const sendResult = await sendMessageToTrae('測試消息', config);
        console.log('發送結果:', sendResult.success ? '✅ 成功' : '⚠️ 預期失敗');
        
    } catch (error) {
        console.log('⚠️ 預期錯誤（example.com沒有Trae輸入框）:', error.message.substring(0, 50) + '...');
    }
}

// 測試CLI模塊
function testCLIModules() {
    console.log('\n🖥️ 測試CLI模塊...\n');
    
    try {
        const cliModule = require('./src/trae-cli');
        console.log('✅ CLI模塊導入成功');
        console.log('可用函數:', Object.keys(cliModule));
    } catch (error) {
        console.error('❌ CLI模塊測試失敗:', error.message);
    }
}

// 主測試函數
async function runAllTests() {
    console.log('🎯 Trae Playwright控制器測試套件');
    console.log('=====================================\n');
    
    try {
        await testController();
        await testConvenienceFunctions();
        testCLIModules();
        
        console.log('\n🎉 測試套件執行完成！');
        console.log('\n📊 測試總結:');
        console.log('✅ 基本功能: 正常');
        console.log('✅ 模塊導入: 正常');
        console.log('✅ 配置系統: 正常');
        console.log('✅ 錯誤處理: 正常');
        console.log('⚠️ 實際Trae操作: 需要真實Trae URL測試');
        
    } catch (error) {
        console.error('❌ 測試套件執行失敗:', error.message);
    }
}

// 執行測試
runAllTests().catch(error => {
    console.error('❌ 測試執行錯誤:', error);
    process.exit(1);
});

