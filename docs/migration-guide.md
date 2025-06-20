# 🚀 mac0620 到 aicore0621 遷移指南

## 📋 概述

本指南將幫助您從舊的 **mac0620** (AppleScript方案) 遷移到新的 **aicore0621** (Playwright方案)，實現更穩定、更現代化的Trae控制體驗。

## 🎯 遷移優勢

### ⚡ 技術升級
| 特性 | mac0620 (舊) | aicore0621 (新) | 改進 |
|------|-------------|----------------|------|
| **技術棧** | AppleScript | Playwright + Node.js | 🚀 現代化 |
| **平台支持** | 僅macOS | macOS/Linux/Windows | 🌍 跨平台 |
| **穩定性** | UI依賴 | 多重定位策略 | 💪 更穩定 |
| **調試** | 困難 | 豐富工具 | 🔧 易調試 |
| **維護** | 分散腳本 | 統一代碼庫 | 📦 易維護 |

### 🎊 功能對比
- ✅ **trae-send** → **trae-vscode-send** (更快、更穩定)
- ✅ **trae-history** → **trae-vscode-history** (更完整的提取)
- ✅ **trae-sync** → **trae-vscode-sync** (更智能的同步)

## 📋 遷移前準備

### 1. 環境檢查
```bash
# 檢查Node.js版本 (需要 >= 16.0)
node --version

# 檢查npm版本
npm --version

# 檢查VS Code是否安裝
code --version
```

### 2. 備份現有配置
```bash
# 備份mac0620配置
cp -r ~/mac0620 ~/mac0620_backup_$(date +%Y%m%d)

# 備份重要腳本
cp ~/.ssh/config ~/.ssh/config.backup
```

### 3. 記錄當前設置
請記錄以下信息，遷移時需要：
- [ ] 服務器IP地址: `________________`
- [ ] SSH密鑰路徑: `________________`
- [ ] GitHub用戶名: `________________`
- [ ] Trae工作目錄: `________________`

## 🚀 自動遷移流程

### 步驟1: 克隆新倉庫
```bash
# 克隆aicore0621倉庫
git clone https://github.com/alexchuang650730/aicore0621.git
cd aicore0621/manus-task-manager
```

### 步驟2: 安裝依賴
```bash
# 安裝Node.js依賴
npm install

# 安裝Playwright瀏覽器
npx playwright install chromium
```

### 步驟3: 執行自動遷移
```bash
# 運行自動遷移工具
node src/utils/migration-tool.js
```

遷移工具將自動：
- 🔍 分析mac0620配置
- 📦 備份現有設置
- ⚙️ 生成新配置
- 📜 創建啟動腳本
- 📊 生成遷移報告

### 步驟4: 配置VS Code
```bash
# 啟動VS Code（調試模式）
code --remote-debugging-port=9222 /your/project/path

# 確保Trae插件已安裝並激活
```

### 步驟5: 測試新系統
```bash
# 測試VS Code連接
npm run trae-vscode-test

# 測試消息發送
npm run trae-vscode-send "測試消息"

# 測試歷史提取
npm run trae-vscode-history
```

## 🔧 手動配置調整

### 配置文件位置
```
aicore0621/manus-task-manager/src/config/
├── config.migrated.js          # 遷移後的主配置
├── vscode-trae.config.js       # VS Code Trae配置
└── mac0620-integration.js      # 整合配置
```

### 關鍵配置項
```javascript
// src/config/config.migrated.js
module.exports = {
  // 基本配置
  baseDir: '/home/用戶名/manus',
  
  // 從mac0620遷移的配置
  legacy: {
    remoteServer: {
      target_server: "您的服務器IP",
      ssh_key_path: "~/.ssh/id_rsa",
      target_directory: "/home/用戶名/aiengine/trae/ec2/git"
    },
    
    github: {
      username: "您的GitHub用戶名"
    },
    
    trae: {
      vscode: {
        executable_path: "/Applications/Visual Studio Code.app/Contents/MacOS/Electron",
        debug_port: 9222,
        workspace_dir: "/path/to/your/project"
      }
    }
  }
};
```

## 📋 功能對照表

### 命令對照
| mac0620 命令 | aicore0621 命令 | 說明 |
|-------------|----------------|------|
| `./trae-send "消息"` | `npm run trae-vscode-send "消息"` | 發送消息到Trae |
| `./trae-history` | `npm run trae-vscode-history` | 提取對話歷史 |
| `./trae-sync` | `npm run trae-vscode-sync` | 同步功能 |
| `python3 trae_mcp_sync.py` | `npm start` | 啟動主程序 |

### 配置對照
| mac0620 配置 | aicore0621 配置 | 位置 |
|-------------|----------------|------|
| `CONFIG["target_server"]` | `legacy.remoteServer.target_server` | config.migrated.js |
| `CONFIG["github_username"]` | `legacy.github.username` | config.migrated.js |
| `CONFIG["check_interval"]` | `legacy.monitoring.check_interval` | config.migrated.js |

## 🔄 啟動方式

### 新的啟動流程
```bash
# 方式1: 使用啟動腳本
./scripts/start-aicore0621.sh

# 方式2: 手動啟動
# 1. 啟動VS Code（調試模式）
code --remote-debugging-port=9222 /your/project

# 2. 啟動Trae控制器
npm run trae-vscode-test

# 3. 啟動Manus任務管理器
npm start
```

### 服務化運行（可選）
```bash
# 創建systemd服務（Linux）
sudo cp scripts/aicore0621.service /etc/systemd/system/
sudo systemctl enable aicore0621
sudo systemctl start aicore0621

# 創建launchd服務（macOS）
cp scripts/com.aicore0621.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.aicore0621.plist
```

## 🐛 故障排除

### 常見問題

#### 1. VS Code連接失敗
```bash
# 檢查VS Code是否以調試模式運行
ps aux | grep "remote-debugging-port"

# 重新啟動VS Code
pkill "Visual Studio Code"
code --remote-debugging-port=9222 /your/project
```

#### 2. Trae插件未找到
```bash
# 檢查Trae插件是否安裝
code --list-extensions | grep -i trae

# 手動安裝Trae插件
code --install-extension trae-extension-id
```

#### 3. 權限問題
```bash
# 修復腳本權限
chmod +x scripts/*.sh
chmod +x src/trae-vscode-cli.js

# 修復配置文件權限
chmod 644 src/config/*.js
```

#### 4. 依賴問題
```bash
# 清理並重新安裝依賴
rm -rf node_modules package-lock.json
npm install

# 重新安裝Playwright
npx playwright install --force
```

## 📊 驗證遷移成功

### 功能測試清單
- [ ] VS Code連接正常
- [ ] Trae插件識別成功
- [ ] 消息發送功能正常
- [ ] 歷史提取功能正常
- [ ] 同步功能正常
- [ ] 錯誤處理正常
- [ ] 日誌記錄正常

### 性能測試
```bash
# 測試消息發送速度
time npm run trae-vscode-send "性能測試"

# 測試歷史提取速度
time npm run trae-vscode-history

# 檢查記憶體使用
ps aux | grep node
```

## 🔄 回滾方案

如果遷移後遇到問題，可以回滾到mac0620：

### 快速回滾
```bash
# 停止aicore0621服務
pkill -f "aicore0621"

# 恢復mac0620備份
cp -r ~/mac0620_backup_* ~/mac0620

# 重新啟動mac0620服務
cd ~/mac0620/smartinvention/Mac
python3 trae_mcp_sync.py
```

### 配置回滾
```bash
# 恢復SSH配置
cp ~/.ssh/config.backup ~/.ssh/config

# 恢復環境變量
# (根據您的具體配置進行調整)
```

## 📞 支援和幫助

### 文檔資源
- [📖 安裝指南](installation.md)
- [📘 使用說明](usage.md)
- [🎯 Trae VS Code插件指南](trae-vscode-guide.md)
- [📗 API文檔](api.md)

### 問題報告
如果遇到問題，請提供以下信息：
1. 操作系統版本
2. Node.js版本
3. VS Code版本
4. 錯誤日誌
5. 配置文件內容

### 聯繫方式
- GitHub Issues: https://github.com/alexchuang650730/aicore0621/issues
- 遷移報告: 查看 `docs/migration-report.md`

---

## 🎉 遷移完成

恭喜！您已成功從mac0620遷移到aicore0621。現在您擁有：

✅ **更穩定的Trae控制**  
✅ **跨平台支持**  
✅ **現代化的技術棧**  
✅ **豐富的調試工具**  
✅ **完整的文檔支持**  

**享受現代化的Trae控制體驗！** 🚀

