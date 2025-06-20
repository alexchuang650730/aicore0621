# Manus任務管理系統 - 安裝指南

## 🔧 系統要求

### 硬體要求
- **記憶體**: 最少 4GB RAM，建議 8GB 以上
- **儲存空間**: 最少 2GB 可用空間
- **網路**: 穩定的網際網路連接

### 軟體要求
- **作業系統**: macOS 10.15+ / Windows 10+ / Ubuntu 18.04+
- **Node.js**: 版本 16.0 或更高
- **Google Chrome**: 最新版本
- **Git**: 用於版本控制

## 📦 安裝步驟

### 1. 安裝 Node.js

#### macOS (使用 Homebrew)
```bash
# 安裝 Homebrew (如果尚未安裝)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安裝 Node.js
brew install node
```

#### macOS (官方安裝包)
1. 訪問 [Node.js 官網](https://nodejs.org/)
2. 下載 LTS 版本的 macOS 安裝包
3. 執行安裝包並按照指示完成安裝

#### Ubuntu/Debian
```bash
# 更新套件列表
sudo apt update

# 安裝 Node.js 和 npm
sudo apt install nodejs npm

# 驗證安裝
node --version
npm --version
```

### 2. 克隆項目

```bash
# 克隆項目到本地
git clone https://github.com/alexchuang650730/aicore0621.git

# 進入項目目錄
cd aicore0621/manus-task-manager
```

### 3. 安裝依賴

```bash
# 安裝 Node.js 依賴
npm init -y
npm install playwright sqlite3

# 安裝 Playwright 瀏覽器
npx playwright install chromium
```

### 4. 配置環境

#### 4.1 創建配置文件
```bash
# 複製配置範例
cp src/config/config.example.js src/config/config.js
```

#### 4.2 編輯配置文件
編輯 `src/config/config.js`，根據您的環境調整以下設定：

```javascript
module.exports = {
    // 基礎目錄 - 數據存儲位置
    baseDir: '/home/您的用戶名/manus',
    
    // Chrome 瀏覽器路徑 (macOS)
    chromeExecutablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    
    // 或 Chrome 瀏覽器路徑 (Ubuntu)
    // chromeExecutablePath: '/usr/bin/google-chrome',
    
    // 數據庫路徑
    dbPath: '/home/您的用戶名/manus/manus_tasks.db',
    
    // 下載目錄
    downloadsDir: '/Users/您的用戶名/Downloads',
    
    // 起始 URL (替換為您的 Manus 任務 URL)
    startUrl: 'https://manus.im/app/您的任務ID'
};
```

### 5. 驗證安裝

```bash
# 執行測試腳本
node src/manus_comprehensive_manager.js --test

# 如果看到以下輸出，表示安裝成功：
# ✅ Node.js environment: OK
# ✅ Playwright installation: OK
# ✅ SQLite3 installation: OK
# ✅ Chrome browser: OK
```

## 🔍 故障排除

### 常見問題

#### 1. Chrome 瀏覽器路徑錯誤
**錯誤**: `Error: Failed to launch browser`

**解決方案**:
```bash
# macOS - 查找 Chrome 路徑
ls -la "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Ubuntu - 查找 Chrome 路徑
which google-chrome
```

#### 2. 權限問題
**錯誤**: `EACCES: permission denied`

**解決方案**:
```bash
# 修改目錄權限
sudo chown -R $USER:$USER /home/您的用戶名/manus
chmod -R 755 /home/您的用戶名/manus
```

#### 3. SQLite3 編譯錯誤
**錯誤**: `node-gyp rebuild failed`

**解決方案**:
```bash
# macOS
xcode-select --install

# Ubuntu
sudo apt install build-essential python3-dev
```

#### 4. Playwright 下載失敗
**錯誤**: `Failed to download browser`

**解決方案**:
```bash
# 設置代理 (如果需要)
export HTTPS_PROXY=http://您的代理地址:端口

# 重新安裝瀏覽器
npx playwright install --force
```

## 🔐 安全設置

### 1. 環境變量配置
創建 `.env` 文件來存儲敏感信息：

```bash
# 創建 .env 文件
touch .env

# 添加以下內容到 .env
MANUS_USERNAME=您的用戶名
MANUS_PASSWORD=您的密碼
GITHUB_TOKEN=您的GitHub令牌
```

### 2. 防火牆設置
確保以下端口可以訪問：
- **443** (HTTPS)
- **80** (HTTP)

## 📋 下一步

安裝完成後，請參閱：
- [使用說明](usage.md) - 了解如何使用系統
- [API文檔](api.md) - 查看詳細的API說明
- [示例文件](../examples/) - 查看使用範例

## 🆘 獲取幫助

如果遇到問題，請：
1. 查看 [故障排除](#故障排除) 部分
2. 檢查 [GitHub Issues](https://github.com/alexchuang650730/aicore0621/issues)
3. 提交新的 Issue 描述您的問題

