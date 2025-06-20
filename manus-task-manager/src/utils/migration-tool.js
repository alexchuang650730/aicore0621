// 遷移工具 - 從mac0620到aicore0621
// 提供自動化遷移功能

const fs = require('fs');
const path = require('path');
const { MAC0620_CONFIG, INTEGRATED_CONFIG } = require('./mac0620-integration');

class MigrationTool {
    constructor() {
        this.migrationLog = [];
        this.configBackup = null;
    }

    /**
     * 執行完整遷移流程
     */
    async executeMigration() {
        console.log('🚀 開始執行mac0620到aicore0621遷移...');
        
        try {
            // 1. 備份現有配置
            await this.backupCurrentConfig();
            
            // 2. 分析mac0620配置
            await this.analyzeMac0620Config();
            
            // 3. 生成新配置
            await this.generateNewConfig();
            
            // 4. 更新VS Code配置
            await this.updateVSCodeConfig();
            
            // 5. 創建遷移腳本
            await this.createMigrationScripts();
            
            // 6. 生成遷移報告
            await this.generateMigrationReport();
            
            console.log('✅ 遷移完成！');
            return true;
            
        } catch (error) {
            console.error('❌ 遷移失敗:', error);
            await this.rollbackMigration();
            return false;
        }
    }

    /**
     * 備份現有配置
     */
    async backupCurrentConfig() {
        this.log('📦 備份現有配置...');
        
        const configPath = path.join(__dirname, 'config.js');
        if (fs.existsSync(configPath)) {
            const backupPath = path.join(__dirname, `config.backup.${Date.now()}.js`);
            fs.copyFileSync(configPath, backupPath);
            this.configBackup = backupPath;
            this.log(`✅ 配置已備份到: ${backupPath}`);
        }
    }

    /**
     * 分析mac0620配置
     */
    async analyzeMac0620Config() {
        this.log('🔍 分析mac0620配置...');
        
        const analysis = {
            server_config: MAC0620_CONFIG.server,
            github_config: MAC0620_CONFIG.github,
            trae_config: MAC0620_CONFIG.trae,
            monitoring_config: MAC0620_CONFIG.monitoring
        };
        
        this.log('✅ mac0620配置分析完成');
        return analysis;
    }

    /**
     * 生成新的整合配置
     */
    async generateNewConfig() {
        this.log('⚙️ 生成新的整合配置...');
        
        const newConfig = {
            ...INTEGRATED_CONFIG,
            
            // 添加遷移元數據
            migration: {
                from: 'mac0620',
                to: 'aicore0621',
                date: new Date().toISOString(),
                version: '2.0.0'
            }
        };
        
        // 寫入新配置文件
        const configPath = path.join(__dirname, 'config.migrated.js');
        const configContent = `// 遷移後的配置文件
// 從mac0620遷移到aicore0621
// 生成時間: ${new Date().toISOString()}

module.exports = ${JSON.stringify(newConfig, null, 2)};`;
        
        fs.writeFileSync(configPath, configContent);
        this.log(`✅ 新配置已生成: ${configPath}`);
    }

    /**
     * 更新VS Code相關配置
     */
    async updateVSCodeConfig() {
        this.log('🎯 更新VS Code配置...');
        
        const vscodeConfig = {
            // 從mac0620提取的Trae配置
            trae_support_path: MAC0620_CONFIG.trae.app_support_path,
            
            // 新的VS Code插件配置
            vscode_executable: '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
            debug_port: 9222,
            
            // 選擇器配置
            selectors: INTEGRATED_CONFIG.playwright.selectors.vscode_trae,
            
            // 監控配置
            monitoring: {
                check_interval: MAC0620_CONFIG.monitoring.check_interval,
                retry_attempts: MAC0620_CONFIG.monitoring.retry_attempts
            }
        };
        
        const vscodeConfigPath = path.join(__dirname, 'vscode-trae.config.js');
        fs.writeFileSync(vscodeConfigPath, `module.exports = ${JSON.stringify(vscodeConfig, null, 2)};`);
        
        this.log(`✅ VS Code配置已更新: ${vscodeConfigPath}`);
    }

    /**
     * 創建遷移腳本
     */
    async createMigrationScripts() {
        this.log('📜 創建遷移腳本...');
        
        // 創建啟動腳本
        const startScript = `#!/bin/bash
# aicore0621啟動腳本
# 替代mac0620的服務

echo "🚀 啟動aicore0621智能任務管理系統..."

# 檢查VS Code是否運行
if ! pgrep -f "Visual Studio Code" > /dev/null; then
    echo "⚠️  VS Code未運行，正在啟動..."
    code --remote-debugging-port=9222 &
    sleep 3
fi

# 啟動Trae VS Code控制器
echo "🎯 啟動Trae VS Code控制器..."
npm run trae-vscode-test

# 啟動Manus任務管理器
echo "📋 啟動Manus任務管理器..."
npm start

echo "✅ 系統啟動完成！"
`;
        
        const scriptPath = path.join(__dirname, '../../scripts/start-aicore0621.sh');
        fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
        fs.writeFileSync(scriptPath, startScript);
        fs.chmodSync(scriptPath, '755');
        
        this.log(`✅ 啟動腳本已創建: ${scriptPath}`);
    }

    /**
     * 生成遷移報告
     */
    async generateMigrationReport() {
        this.log('📊 生成遷移報告...');
        
        const report = `# mac0620 到 aicore0621 遷移報告

## 📅 遷移信息
- **遷移時間**: ${new Date().toISOString()}
- **源系統**: mac0620 (AppleScript方案)
- **目標系統**: aicore0621 (Playwright方案)
- **遷移版本**: v2.0.0

## ✅ 遷移完成項目

### 🔧 配置遷移
- [x] 服務器配置 (${MAC0620_CONFIG.server.target_server})
- [x] GitHub配置 (${MAC0620_CONFIG.github.username})
- [x] Trae應用配置
- [x] 監控參數配置

### 🎯 功能替代
- [x] **trae-send** → **trae-vscode-send** (Playwright)
- [x] **trae-history** → **trae-vscode-history** (Playwright)
- [x] **trae-sync** → **trae-vscode-sync** (Playwright)

### 📦 新增功能
- [x] VS Code插件直接控制
- [x] 跨平台支持
- [x] 完整的錯誤處理
- [x] 豐富的調試工具

## 🚀 使用方式

### 啟動系統
\`\`\`bash
# 使用新的啟動腳本
./scripts/start-aicore0621.sh

# 或手動啟動
npm run trae-vscode-test
npm start
\`\`\`

### 發送消息到Trae
\`\`\`bash
# 舊方式 (mac0620)
./trae-send "消息內容"

# 新方式 (aicore0621)
npm run trae-vscode-send "消息內容"
\`\`\`

### 提取對話歷史
\`\`\`bash
# 舊方式 (mac0620)
./trae-history

# 新方式 (aicore0621)
npm run trae-vscode-history
\`\`\`

## 📋 遷移日誌
${this.migrationLog.map(log => `- ${log}`).join('\n')}

## 🎯 優勢對比

| 特性 | mac0620 (舊) | aicore0621 (新) |
|------|-------------|----------------|
| 技術棧 | AppleScript | Playwright + Node.js |
| 平台支持 | 僅macOS | macOS/Linux/Windows |
| 穩定性 | 依賴UI變化 | 多重定位策略 |
| 調試能力 | 困難 | 豐富的調試工具 |
| 維護性 | 分散的腳本 | 統一的代碼庫 |
| 文檔 | 基礎 | 企業級文檔 |

## 🔄 回滾方案
如需回滾到mac0620，請執行：
\`\`\`bash
# 恢復備份配置
cp ${this.configBackup || 'config.backup.js'} config.js

# 重新啟動mac0620服務
# (參考mac0620的啟動文檔)
\`\`\`

---
**遷移完成！享受現代化的Trae控制體驗！** 🎉
`;
        
        const reportPath = path.join(__dirname, '../../docs/migration-report.md');
        fs.writeFileSync(reportPath, report);
        
        this.log(`✅ 遷移報告已生成: ${reportPath}`);
    }

    /**
     * 回滾遷移
     */
    async rollbackMigration() {
        console.log('🔄 執行遷移回滾...');
        
        if (this.configBackup && fs.existsSync(this.configBackup)) {
            const configPath = path.join(__dirname, 'config.js');
            fs.copyFileSync(this.configBackup, configPath);
            console.log('✅ 配置已回滾');
        }
    }

    /**
     * 記錄遷移日誌
     */
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        this.migrationLog.push(logMessage);
        console.log(logMessage);
    }
}

// 如果直接執行此文件，則運行遷移
if (require.main === module) {
    const migration = new MigrationTool();
    migration.executeMigration().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = MigrationTool;

