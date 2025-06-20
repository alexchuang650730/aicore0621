#!/usr/bin/env node

/**
 * Trae Playwright CLI工具
 * 命令行界面，用於執行各種Trae操作
 */

const { TraePlaywrightController, sendMessageToTrae, extractTraeHistory, getTraeShareLink } = require('./trae-playwright-controller');
const fs = require('fs');
const path = require('path');

// 命令行參數解析
const args = process.argv.slice(2);
const command = args[0];

// 配置文件路徑
const configPath = path.join(__dirname, 'config', 'trae-config.json');

/**
 * 加載配置文件
 */
function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        }
    } catch (error) {
        console.warn('⚠️ 無法加載配置文件，使用默認配置');
    }
    
    return {
        traeUrl: 'https://manus.im/app/',
        headless: false,
        timeout: 30000,
        waitTime: 2000,
        outputDir: '/tmp/trae-playwright'
    };
}

/**
 * 保存配置文件
 */
function saveConfig(config) {
    try {
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('✅ 配置已保存');
    } catch (error) {
        console.error('❌ 保存配置失敗:', error.message);
    }
}

/**
 * 顯示幫助信息
 */
function showHelp() {
    console.log(`
🎯 Trae Playwright CLI工具

用法:
  node trae-cli.js <命令> [選項]

命令:
  send <消息>              發送消息到Trae
  history                  提取對話歷史
  share                    獲取分享鏈接
  config                   配置管理
  test                     測試連接

範例:
  # 發送消息
  node trae-cli.js send "你好，這是測試消息"
  
  # 發送消息到特定任務
  node trae-cli.js send "測試" --url "https://manus.im/app/task123"
  
  # 提取歷史記錄
  node trae-cli.js history
  
  # 獲取分享鏈接
  node trae-cli.js share
  
  # 配置設置
  node trae-cli.js config --set traeUrl "https://manus.im/app/mytask"
  node trae-cli.js config --show
  
  # 測試連接
  node trae-cli.js test

選項:
  --url <URL>              指定Trae任務URL
  --headless               無頭模式運行
  --timeout <毫秒>         設置超時時間
  --output <目錄>          設置輸出目錄
  --config <文件>          指定配置文件
  --help                   顯示幫助信息
`);
}

/**
 * 解析命令行選項
 */
function parseOptions(args) {
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            const nextArg = args[i + 1];
            
            if (nextArg && !nextArg.startsWith('--')) {
                options[key] = nextArg;
                i++; // 跳過下一個參數
            } else {
                options[key] = true;
            }
        }
    }
    
    return options;
}

/**
 * 發送消息命令
 */
async function sendCommand(message, options) {
    if (!message) {
        console.error('❌ 請提供要發送的消息');
        process.exit(1);
    }
    
    console.log(`📝 準備發送消息: "${message}"`);
    
    const config = {
        ...loadConfig(),
        taskUrl: options.url,
        headless: options.headless || false,
        timeout: parseInt(options.timeout) || 30000,
        outputDir: options.output || '/tmp/trae-playwright'
    };
    
    try {
        const result = await sendMessageToTrae(message, config);
        
        if (result.success) {
            console.log('✅ 消息發送成功!');
        } else {
            console.error('❌ 消息發送失敗:', result.error);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ 發送過程中出錯:', error.message);
        process.exit(1);
    }
}

/**
 * 提取歷史命令
 */
async function historyCommand(options) {
    console.log('📚 開始提取對話歷史...');
    
    const config = {
        ...loadConfig(),
        taskUrl: options.url,
        headless: options.headless || false,
        timeout: parseInt(options.timeout) || 30000,
        outputDir: options.output || '/tmp/trae-playwright'
    };
    
    try {
        const result = await extractTraeHistory(config);
        
        if (result.success) {
            console.log(`✅ 歷史提取成功! 共 ${result.totalCount} 條消息`);
            console.log(`📁 保存到: ${result.outputFile}`);
            
            // 顯示分類統計
            console.log('\n📊 消息分類統計:');
            Object.entries(result.messages).forEach(([category, messages]) => {
                console.log(`  ${category}: ${messages.length} 條`);
            });
        } else {
            console.error('❌ 歷史提取失敗:', result.error);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ 提取過程中出錯:', error.message);
        process.exit(1);
    }
}

/**
 * 獲取分享鏈接命令
 */
async function shareCommand(options) {
    console.log('🔗 開始獲取分享鏈接...');
    
    const config = {
        ...loadConfig(),
        taskUrl: options.url,
        headless: options.headless || false,
        timeout: parseInt(options.timeout) || 30000
    };
    
    try {
        const result = await getTraeShareLink(config);
        
        if (result.success) {
            console.log('✅ 分享鏈接獲取成功!');
            console.log(`🔗 鏈接: ${result.shareLink}`);
        } else {
            console.error('❌ 分享鏈接獲取失敗:', result.error);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ 獲取過程中出錯:', error.message);
        process.exit(1);
    }
}

/**
 * 配置管理命令
 */
function configCommand(options) {
    const config = loadConfig();
    
    if (options.show) {
        console.log('📋 當前配置:');
        console.log(JSON.stringify(config, null, 2));
        return;
    }
    
    if (options.set) {
        const [key, value] = options.set.split('=');
        if (key && value) {
            config[key] = value;
            saveConfig(config);
            console.log(`✅ 已設置 ${key} = ${value}`);
        } else {
            console.error('❌ 無效的設置格式，請使用: --set key=value');
        }
        return;
    }
    
    // 交互式配置
    console.log('🔧 交互式配置 (按Enter使用當前值):');
    // 這裡可以添加交互式配置邏輯
    console.log('當前配置:');
    console.log(JSON.stringify(config, null, 2));
}

/**
 * 測試連接命令
 */
async function testCommand(options) {
    console.log('🧪 測試Trae連接...');
    
    const config = {
        ...loadConfig(),
        taskUrl: options.url,
        headless: options.headless !== undefined ? options.headless : true,
        timeout: parseInt(options.timeout) || 30000
    };
    
    const controller = new TraePlaywrightController(config);
    
    try {
        await controller.navigateToTrae();
        await controller.takeScreenshot('test-connection.png');
        console.log('✅ 連接測試成功!');
        console.log('📸 已保存測試截圖');
    } catch (error) {
        console.error('❌ 連接測試失敗:', error.message);
        process.exit(1);
    } finally {
        await controller.cleanup();
    }
}

/**
 * 主函數
 */
async function main() {
    const options = parseOptions(args.slice(1));
    
    if (options.help || !command) {
        showHelp();
        return;
    }
    
    switch (command) {
        case 'send':
            const message = args[1];
            await sendCommand(message, options);
            break;
            
        case 'history':
            await historyCommand(options);
            break;
            
        case 'share':
            await shareCommand(options);
            break;
            
        case 'config':
            configCommand(options);
            break;
            
        case 'test':
            await testCommand(options);
            break;
            
        default:
            console.error(`❌ 未知命令: ${command}`);
            showHelp();
            process.exit(1);
    }
}

// 錯誤處理
process.on('unhandledRejection', (error) => {
    console.error('❌ 未處理的錯誤:', error.message);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n👋 程序被中斷');
    process.exit(0);
});

// 執行主函數
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 程序執行失敗:', error.message);
        process.exit(1);
    });
}

module.exports = {
    sendCommand,
    historyCommand,
    shareCommand,
    configCommand,
    testCommand
};

