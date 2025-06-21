# Manus任務管理系統 - 使用說明

## 🎯 系統概述

Manus任務管理系統是一個基於Playwright的智能自動化工具，能夠：
- 自動收集Manus平台的任務數據
- 智能分類對話內容
- 管理和下載任務相關文件
- 向任務發送自定義消息
- 生成詳細的分析報告

## 🚀 快速開始

### 1. 基本使用

```bash
# 進入項目目錄
cd aicore0621/manus-task-manager

# 執行主腳本
node src/manus_comprehensive_manager.js
```

### 2. 指定特定任務

```bash
# 處理特定任務
node src/manus_comprehensive_manager.js --task-url "https://manus.im/app/您的任務ID"
```

### 3. 僅收集數據（不發送消息）

```bash
# 僅收集模式
node src/manus_comprehensive_manager.js --collect-only
```

## 📋 功能詳解

### 🔍 數據收集功能

#### 任務列表遍歷
系統會自動：
1. 掃描左側任務列表
2. 逐一點擊每個任務
3. 提取任務基本信息

#### 對話歷史收集
對每個任務：
1. 點擊右上角的 **Share** 按鈕
2. 複製 replay URL
3. 訪問 replay 頁面提取完整對話歷史
4. 自動分類為：[思考]、[觀察]、[行動]

#### 智能分類邏輯

**[思考]** - 包含以下關鍵詞的內容：
- 我認為、我覺得、分析、考慮、思考
- 判斷、評估、推理、計劃、策略
- 假設、推測、預測、設想、構思

**[觀察]** - 包含以下關鍵詞的內容：
- 我看到、發現、注意到、觀察、檢測
- 顯示、出現、結果、確認意圖、確認
- 理解、明白、了解、識別、檢查

**[行動]** - 包含以下關鍵詞的內容：
- 執行、運行、創建、修改、發送
- 點擊、操作、實施、完成、開始
- 啟動、停止、刪除、更新、安裝

### 📁 文件管理功能

#### 文件分類下載
系統支援四種文件類型：

1. **Documents** - 文檔文件
   - PDF、DOC、DOCX、TXT等
   - 存儲路徑：`/manus/taskxxx/doc/documents/`

2. **Images** - 圖片文件
   - PNG、JPG、GIF、SVG等
   - 存儲路徑：`/manus/taskxxx/doc/images/`

3. **Code files** - 代碼文件
   - JS、PY、HTML、CSS等
   - 存儲路徑：`/manus/taskxxx/doc/code_files/`

4. **Links** - 鏈接文件
   - URL、書籤等
   - 存儲路徑：`/manus/taskxxx/doc/links/`

#### 自動下載流程
```
1. 點擊任務右側的文件按鈕
2. 選擇文件類型標籤
3. 點擊 "Batch download"
4. 從 Downloads 移動到對應目錄
5. 更新數據庫記錄
```

### 💬 消息發送功能

#### 自動消息發送
```javascript
// 預設消息內容
const defaultMessage = "🤖 自動化系統檢查：請確認任務狀態和進度。如有需要，請提供最新的更新信息。";
```

#### 自定義消息
```bash
# 發送自定義消息
node src/manus_comprehensive_manager.js --message "您的自定義消息內容"
```

#### 批量消息處理
```bash
# 從文件讀取消息列表
node src/manus_comprehensive_manager.js --message-file messages.txt
```

### 🗄️ 數據庫功能

#### 數據庫結構
系統使用SQLite數據庫，包含以下表格：

**tasks** - 任務信息
```sql
- id: 任務ID
- name: 任務名稱
- display_name: 顯示名稱
- replay_url: Replay URL
- created_at: 創建時間
- last_updated: 最後更新時間
- status: 任務狀態
```

**messages** - 消息記錄
```sql
- id: 消息ID
- task_id: 關聯任務ID
- content: 消息內容
- category: 分類 ([思考]/[觀察]/[行動])
- timestamp: 時間戳
- source: 來源 (user/manus/system)
- message_type: 消息類型
```

**files** - 文件記錄
```sql
- id: 文件ID
- task_id: 關聯任務ID
- filename: 文件名
- filepath: 文件路徑
- file_type: 文件類型
- file_category: 文件分類
- file_size: 文件大小
- created_at: 創建時間
```

#### 數據查詢範例
```javascript
// 查詢特定任務的所有思考類消息
const thinkingMessages = await db.all(`
    SELECT * FROM messages 
    WHERE task_id = ? AND category = '思考'
    ORDER BY timestamp DESC
`, [taskId]);

// 統計各類型文件數量
const fileStats = await db.all(`
    SELECT file_category, COUNT(*) as count 
    FROM files 
    WHERE task_id = ? 
    GROUP BY file_category
`, [taskId]);
```

## 📊 報告功能

### 自動生成報告
系統會自動生成以下報告：

#### 1. 任務處理報告
```
📋 任務處理報告
==================
處理時間: 2025-06-20 15:30:00
總任務數: 5
成功處理: 5
失敗任務: 0
總處理時間: 15分30秒
```

#### 2. 數據統計報告
```
📊 數據統計
==================
總消息數: 150
- [思考]: 45 (30%)
- [觀察]: 60 (40%)  
- [行動]: 45 (30%)

總文件數: 25
- Documents: 8
- Images: 10
- Code files: 5
- Links: 2
```

#### 3. 文件下載報告
```
📁 文件下載報告
==================
成功下載: 23/25
失敗下載: 2
總大小: 45.6 MB
平均文件大小: 1.8 MB
```

## ⚙️ 高級配置

### 1. 自定義分類關鍵詞
編輯 `src/config/classification.js`：

```javascript
module.exports = {
    CLASSIFICATION_KEYWORDS: {
        '思考': [
            // 添加您的自定義關鍵詞
            '分析', '評估', '考慮'
        ],
        '觀察': [
            '發現', '注意到', '確認'
        ],
        '行動': [
            '執行', '實施', '完成'
        ]
    }
};
```

### 2. 調整等待時間
```javascript
// 在配置文件中調整
const CONFIG = {
    waitTime: 3000,        // 基本等待時間
    longWaitTime: 10000,   // 長等待時間
    retryAttempts: 3       // 重試次數
};
```

### 3. 設置代理
```javascript
// 瀏覽器代理設置
const browser = await chromium.launch({
    proxy: {
        server: 'http://proxy-server:port',
        username: 'username',
        password: 'password'
    }
});
```

## 🔧 故障排除

### 常見問題解決

#### 1. 任務列表無法加載
```bash
# 檢查網路連接
ping manus.im

# 檢查瀏覽器版本
google-chrome --version
```

#### 2. 文件下載失敗
```bash
# 檢查下載目錄權限
ls -la /Users/您的用戶名/Downloads

# 清理下載目錄
rm -rf /Users/您的用戶名/Downloads/temp_*
```

#### 3. 數據庫錯誤
```bash
# 檢查數據庫文件
sqlite3 /home/您的用戶名/manus/manus_tasks.db ".tables"

# 重建數據庫
rm /home/您的用戶名/manus/manus_tasks.db
node src/manus_comprehensive_manager.js --init-db
```

## 📈 性能優化

### 1. 批量處理
```bash
# 設置批量大小
node src/manus_comprehensive_manager.js --batch-size 5
```

### 2. 並行處理
```bash
# 啟用並行模式（謹慎使用）
node src/manus_comprehensive_manager.js --parallel --max-workers 2
```

### 3. 記憶體優化
```bash
# 增加Node.js記憶體限制
node --max-old-space-size=4096 src/manus_comprehensive_manager.js
```

## 🔄 定期維護

### 1. 數據庫清理
```bash
# 清理30天前的舊數據
node src/utils/cleanup.js --days 30
```

### 2. 日誌輪轉
```bash
# 壓縮舊日誌
node src/utils/log-rotate.js
```

### 3. 更新檢查
```bash
# 檢查更新
git pull origin main
npm update
```

## 📞 技術支援

如需技術支援，請：
1. 查看 [API文檔](api.md)
2. 檢查 [GitHub Issues](https://github.com/alexchuang650730/aicore0621/issues)
3. 聯繫開發團隊

