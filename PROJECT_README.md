# Developer Flow Project - 完整項目包

## 📦 **項目內容**

這個壓縮包包含完整的 Developer Flow 項目，包括所有 MCP 適配器、管理界面和配置文件。

## 🏗️ **項目結構**

```
developer_flow/
├── adminboard/
│   └── smartinvention_ui/          # Enhanced Smart UI for Manus
│       └── smartinvention_backend/ # Flask 後端 (端口 8888)
├── mcp/
│   ├── coordinator/
│   │   └── mcp_coordinator/        # MCP 統一協調器 (端口 9000)
│   ├── adapter/
│   │   ├── smartinvention_mcp/     # SmartInvention MCP 適配器
│   │   ├── rl_srt_mcp/            # RL SRT MCP 適配器
│   │   ├── cloud_edge_data_mcp/   # Cloud Edge Data MCP 適配器
│   │   └── interaction_log_mcp/   # Interaction Log MCP 適配器
│   ├── workflow/
│   │   └── smartinvention_workflow/
│   └── data_integration/
│       ├── manus/                 # Manus 數據整合
│       └── trae/                  # TRAE 數據整合
├── config/                        # 配置文件
├── data/                         # 數據存儲
└── logs/                         # 系統日誌
```

## 🚀 **部署指南**

### **1. 解壓項目**
```bash
tar -xzf developer_flow_project.tar.gz
cd developer_flow/
```

### **2. 啟動 MCP Coordinator**
```bash
cd mcp/coordinator/mcp_coordinator/
source venv/bin/activate
python src/main.py
# 運行在端口 9000
```

### **3. 啟動 AdminBoard UI**
```bash
cd adminboard/smartinvention_ui/smartinvention_backend/
source venv/bin/activate
python src/main.py
# 運行在端口 8888
```

### **4. 啟動各個 MCP 適配器**
```bash
# SmartInvention MCP
cd mcp/adapter/smartinvention_mcp/smartinvention_adapter/
source venv/bin/activate
python src/main.py

# RL SRT MCP
cd mcp/adapter/rl_srt_mcp/rl_srt_adapter/
source venv/bin/activate
python src/main.py
```

## 🌐 **訪問地址**

- **AdminBoard UI**: http://localhost:8888
- **MCP Coordinator**: http://localhost:9000
- **API 文檔**: http://localhost:9000/api/status

## 🔧 **核心功能**

### **MCP Coordinator (端口 9000)**
- 統一協調所有 MCP 適配器
- 數據流管理和路由
- 適配器註冊和狀態監控
- Manus/TRAE 數據整合

### **Enhanced Smart UI (端口 8888)**
- Manus 系統智能管理界面
- 實時數據監控和可視化
- MCP 適配器狀態管理
- 測試和調試工具

### **MCP 適配器**
- **SmartInvention MCP**: Manus 對話歷史處理
- **RL SRT MCP**: 強化學習數據處理
- **Cloud Edge Data MCP**: 雲邊緣數據管理
- **Interaction Log MCP**: 交互日誌分析

## 📊 **數據流架構**

```
Manus/TRAE → Data Integration → MCP Adapters → MCP Coordinator → AdminBoard UI
```

## 🔒 **安全配置**

- 所有服務默認綁定到 0.0.0.0，支持外部訪問
- CORS 已配置，支持跨域請求
- SQLite 數據庫用於本地數據存儲

## 📝 **開發說明**

- 基於 Flask 框架開發
- 使用 SQLite 作為數據庫
- 支持異步數據處理
- 模塊化 MCP 架構設計

## 🆘 **故障排除**

1. **端口衝突**: 修改各服務的端口配置
2. **權限問題**: 確保有足夠的文件讀寫權限
3. **依賴缺失**: 在虛擬環境中安裝 requirements.txt

## 📞 **技術支持**

如有問題，請檢查各服務的日誌文件或聯繫開發團隊。

---
**創建時間**: 2025-06-21  
**版本**: v1.0  
**作者**: Manus AI Team

