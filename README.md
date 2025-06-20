# AI Core 0621 - Manus任務管理系統

## 🎯 項目概述

這是一個基於Playwright的智能任務管理系統，專門為Manus平台設計，能夠自動化收集、分析和管理任務數據。

## 🚀 主要功能

### 📊 數據收集
- 自動遍歷任務列表
- 獲取每個任務的replay URL
- 提取完整對話歷史
- 智能分類：[思考][觀察][行動]

### 📁 文件管理
- 四種類型分類下載：Documents/Images/Code files/Links
- 自動目錄組織：`/home/alexchuang/manus/taskxxx/doc/`
- 從Downloads自動移動到對應目錄

### 💬 消息功能
- 向每個任務發送自定義消息
- 自動記錄發送的消息
- 支持批量消息處理

### 🗄️ SQLite數據庫
- 完整的關聯式數據庫設計
- 任務、消息、文件、會話記錄
- 自動分類和索引

## 📁 項目結構

```
aicore0621/
├── README.md                           # 項目說明
├── manus-task-manager/                 # Manus任務管理系統
│   ├── src/                           # 源代碼
│   │   ├── manus_comprehensive_manager.js  # 主要腳本
│   │   ├── config/                    # 配置文件
│   │   └── utils/                     # 工具函數
│   ├── docs/                          # 文檔
│   │   ├── installation.md           # 安裝指南
│   │   ├── usage.md                  # 使用說明
│   │   └── api.md                    # API文檔
│   └── examples/                      # 示例文件
└── docs/                              # 項目總體文檔
    └── development-log.md             # 開發日誌
```

## 🛠️ 技術棧

- **Node.js** - 運行環境
- **Playwright** - 瀏覽器自動化
- **SQLite3** - 數據庫
- **JavaScript** - 主要編程語言

## 📋 版本歷史

### v1.0.0 (2025-06-20)
- ✅ 完成Manus任務管理系統核心功能
- ✅ 實現自動化數據收集
- ✅ 建立SQLite數據庫結構
- ✅ 支持文件分類下載
- ✅ 實現消息自動分類

## 🤝 貢獻

歡迎提交Issue和Pull Request來改進這個項目。

## 📄 許可證

MIT License

