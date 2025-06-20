#!/usr/bin/env node

/**
 * Trae VS Code插件 CLI工具
 * 命令行界面，用於執行Trae VS Code插件操作
 */

const { TraeVSCodeController, sendMessageToTrae, extractTraeHistory } = require('./trae-vscode-controller');
const fs = require('fs');
const path = require('path');

// 命令行參數解析
const args = process.argv.slice(2);
const command = args[0];

// 配置文件路徑
const configPath = path.join(__dirname, 'config', 'trae-vscode-config.json');

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
        vscodeExecutablePath: null, // 使用默認路徑
        workspaceDir: process.cwd(),
        headless: false,
        timeout: 30000,
        waitTime: 2000,
        outputDir: '/tmp/trae-vscode'
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
🎯 Trae VS Code插件 CLI工具

用法:
  node trae-vscode-cli.js <命令> [選項]

命令:
  send <消息>              發送消息到Trae插件
  history                  提取對話歷史
  config                   配置管理
  test                     測試VS Code連接
  screenshot               截圖當前狀態

範例:
  # 發送消息
  node trae-vscode-cli.js send "你好，這是測試消息"
  
  # 發送消息到特定工作區
  node trae-vscode-cli.js send "測試" --workspace "/path/to/project"
  
  # 提取歷史記錄
  node trae-vscode-cli.js history
  
  # 配置VS Code路徑
  node trae-vscode-cli.js config --set vscodeExecutablePath="/Applications/Visual Studio Code.app/Contents/MacOS/Electron"
  node trae-vscode-cli.js config --show
  
  # 測試連接
  node trae-vscode-cli.js test
  
  # 截圖調試
  node trae-vscode-cli.js screenshot

選項:
  --workspace <路徑>       指定VS Code工作區目錄
  --vscode-path <路徑>     指定VS Code可執行文件路徑
  --timeout <毫秒>         設置超時時間
  --output <目錄>          設置輸出目錄
  --config <文件>          指定配置文件
  --help                   顯示幫助信息

注意事項:
  1. 需要先啟動VS Code並安裝Trae插件
  2. VS Code需要以調試模式啟動（--remote-debugging-port=9222）
  3. 確保Trae插件面板已打開
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
    
    console.log(`📝 準備發送消息到Trae: "${message}"`);
    
    const config = {
        ...loadConfig(),
        workspaceDir: options.workspace || process.cwd(),
        vscodeExecutablePath: options['vscode-path'],
        timeout: parseInt(options.timeout) || 30000,
        outputDir: options.output || '/tmp/trae-vscode'
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
    console.log('📚 開始提取Trae對話歷史...');
    
    const config = {
        ...loadConfig(),
        workspaceDir: options.workspace || process.cwd(),
        vscodeExecutablePath: options['vscode-path'],
        timeout: parseInt(options.timeout) || 30000,
        outputDir: options.output || '/tmp/trae-vscode'
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
    
    // 顯示當前配置
    console.log('🔧 當前配置:');
    console.log(JSON.stringify(config, null, 2));
    console.log('\n💡 使用 --set key=value 來修改配置');
    console.log('💡 使用 --show 來查看配置');
}

/**
 * 測試連接命令
 */
async function testCommand(options) {
    console.log('🧪 測試Trae VS Code連接...');
    
    const config = {
        ...loadConfig(),
        workspaceDir: options.workspace || process.cwd(),
        vscodeExecutablePath: options['vscode-path'],
        timeout: parseInt(options.timeout) || 30000
    };
    
    const controller = new TraeVSCodeController(config);
    
    try {
        await controller.initialize();
        await controller.takeScreenshot('test-connection.png');
        console.log('✅ 連接測試成功!');
        console.log('📸 已保存測試截圖');
        
        // 顯示一些基本信息
        console.log('\n📋 連接信息:');
        console.log(`VS Code路徑: ${config.vscodeExecutablePath || '自動檢測'}`);
        console.log(`工作區: ${config.workspaceDir}`);
        console.log(`輸出目錄: ${config.outputDir}`);
        
    } catch (error) {
        console.error('❌ 連接測試失敗:', error.message);
        console.log('\n💡 故障排除建議:');
        console.log('1. 確保VS Code已安裝並可正常啟動');
        console.log('2. 確保Trae插件已安裝並啟用');
        console.log('3. 嘗試手動啟動VS Code: code --remote-debugging-port=9222');
        console.log('4. 檢查VS Code路徑配置是否正確');
        process.exit(1);
    } finally {
        await controller.cleanup();
    }
}

/**
 * 截圖命令
 */
async function screenshotCommand(options) {
    console.log('📸 截圖當前VS Code狀態...');
    
    const config = {
        ...loadConfig(),
        workspaceDir: options.workspace || process.cwd(),
        vscodeExecutablePath: options['vscode-path'],
        timeout: parseInt(options.timeout) || 30000
    };
    
    const controller = new TraeVSCodeController(config);
    
    try {
        await controller.initialize();
        const screenshotPath = await controller.takeScreenshot('manual-screenshot.png');
        
        if (screenshotPath) {
            console.log('✅ 截圖成功!');
            console.log(`📁 保存到: ${screenshotPath}`);
        } else {
            console.log('❌ 截圖失敗');
        }
        
    } catch (error) {
        console.error('❌ 截圖過程中出錯:', error.message);
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
            
        case 'config':
            configCommand(options);
            break;
            
        case 'test':
            await testCommand(options);
            break;
            
        case 'screenshot':
            await screenshotCommand(options);
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
    configCommand,
    testCommand,
    screenshotCommand
};

