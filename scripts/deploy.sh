#!/bin/bash

# AICore0621 部署腳本
# 用於快速部署和配置系統

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查系統要求
check_requirements() {
    log_info "檢查系統要求..."
    
    # 檢查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝。請先安裝 Node.js 16.0 或更高版本"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js 版本過低。需要 16.0 或更高版本，當前版本: $(node -v)"
        exit 1
    fi
    
    # 檢查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安裝"
        exit 1
    fi
    
    # 檢查git
    if ! command -v git &> /dev/null; then
        log_error "git 未安裝"
        exit 1
    fi
    
    log_success "系統要求檢查通過"
}

# 克隆或更新項目
setup_project() {
    log_info "設置項目..."
    
    if [ -d "aicore0621" ]; then
        log_info "項目目錄已存在，更新代碼..."
        cd aicore0621
        git pull origin main
        cd ..
    else
        log_info "克隆項目..."
        git clone https://github.com/alexchuang650730/aicore0621.git
    fi
    
    log_success "項目設置完成"
}

# 安裝依賴
install_dependencies() {
    log_info "安裝依賴..."
    
    cd aicore0621/manus-task-manager
    
    # 安裝Node.js依賴
    log_info "安裝Node.js依賴..."
    npm install
    
    # 安裝Playwright瀏覽器
    log_info "安裝Playwright瀏覽器..."
    npm run install-browsers || npx playwright install chromium
    
    cd ../..
    
    log_success "依賴安裝完成"
}

# 創建配置文件
create_config() {
    log_info "創建配置文件..."
    
    CONFIG_DIR="aicore0621/manus-task-manager/src/config"
    CONFIG_FILE="$CONFIG_DIR/config.js"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        log_info "創建默認配置文件..."
        
        mkdir -p "$CONFIG_DIR"
        
        cat > "$CONFIG_FILE" << 'EOF'
module.exports = {
    // Manus平台配置
    manus: {
        baseUrl: 'https://your-manus-instance.com',
        loginUrl: 'https://your-manus-instance.com/login',
        taskListUrl: 'https://your-manus-instance.com/tasks',
        // 登錄憑證（請根據實際情況修改）
        credentials: {
            username: process.env.MANUS_USERNAME || '',
            password: process.env.MANUS_PASSWORD || ''
        }
    },
    
    // TRAE配置
    trae: {
        vscodeIntegration: true,
        autoClassification: true,
        historyDepth: 1000,
        // TRAE相關URL
        baseUrl: 'https://your-trae-instance.com'
    },
    
    // 數據庫配置
    database: {
        path: './data/manus_tasks.db',
        backup: true,
        backupInterval: 3600000, // 1小時
        maxBackups: 10
    },
    
    // 下載配置
    downloads: {
        path: './downloads',
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.gif', '.svg', '.js', '.py', '.html', '.css', '.json', '.csv', '.xml', '.yaml'],
        createSubfolders: true
    },
    
    // 性能配置
    performance: {
        concurrentTasks: 3,
        pageTimeout: 30000,
        retryAttempts: 3,
        delayBetweenActions: 1000,
        memoryLimit: 512 // MB
    },
    
    // 分類器配置
    classifier: {
        thinkingKeywords: ['分析', '思考', '考慮', '評估', '判斷', '推理'],
        observationKeywords: ['檢查', '查看', '發現', '注意到', '觀察', '監控'],
        actionKeywords: ['執行', '運行', '創建', '修改', '刪除', '更新', '部署']
    },
    
    // 日誌配置
    logging: {
        level: 'info',
        file: './logs/manus-task-manager.log',
        maxSize: '10m',
        maxFiles: 5
    }
};
EOF
        
        log_success "配置文件已創建: $CONFIG_FILE"
        log_warning "請編輯配置文件以適應您的環境"
    else
        log_info "配置文件已存在，跳過創建"
    fi
}

# 創建必要目錄
create_directories() {
    log_info "創建必要目錄..."
    
    BASE_DIR="aicore0621/manus-task-manager"
    
    mkdir -p "$BASE_DIR/data"
    mkdir -p "$BASE_DIR/downloads"
    mkdir -p "$BASE_DIR/logs"
    mkdir -p "$BASE_DIR/temp"
    mkdir -p "$BASE_DIR/backup"
    
    log_success "目錄創建完成"
}

# 設置環境變量
setup_environment() {
    log_info "設置環境變量..."
    
    ENV_FILE="aicore0621/manus-task-manager/.env"
    
    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" << 'EOF'
# Manus平台憑證
MANUS_USERNAME=
MANUS_PASSWORD=

# TRAE配置
TRAE_ENABLED=true

# 調試模式
DEBUG=false
LOG_LEVEL=info

# 性能配置
MAX_CONCURRENT_TASKS=3
PAGE_TIMEOUT=30000

# 數據庫配置
DB_BACKUP_ENABLED=true
DB_BACKUP_INTERVAL=3600000
EOF
        
        log_success "環境變量文件已創建: $ENV_FILE"
        log_warning "請編輯 .env 文件設置您的憑證"
    else
        log_info "環境變量文件已存在"
    fi
}

# 初始化數據庫
init_database() {
    log_info "初始化數據庫..."
    
    cd aicore0621/manus-task-manager
    
    # 創建數據庫初始化腳本
    cat > "scripts/init-db.js" << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/manus_tasks.db');
const db = new sqlite3.Database(dbPath);

// 創建表結構
db.serialize(() => {
    // 任務表
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id TEXT UNIQUE NOT NULL,
            title TEXT,
            status TEXT DEFAULT 'active',
            url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            collected_at DATETIME
        )
    `);
    
    // 消息表
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            message_type TEXT DEFAULT 'other',
            confidence REAL DEFAULT 0.0,
            timestamp DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(task_id)
        )
    `);
    
    // 文件表
    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            file_type TEXT,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            download_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(task_id)
        )
    `);
    
    // 統計表
    db.run(`
        CREATE TABLE IF NOT EXISTS statistics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            total_tasks INTEGER DEFAULT 0,
            total_messages INTEGER DEFAULT 0,
            total_files INTEGER DEFAULT 0,
            thinking_messages INTEGER DEFAULT 0,
            observation_messages INTEGER DEFAULT 0,
            action_messages INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // 創建索引
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_task_id ON messages(task_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_files_task_id ON files(task_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    
    console.log('數據庫初始化完成');
});

db.close();
EOF
    
    # 運行數據庫初始化
    mkdir -p scripts
    node scripts/init-db.js
    
    cd ../..
    
    log_success "數據庫初始化完成"
}

# 創建啟動腳本
create_startup_scripts() {
    log_info "創建啟動腳本..."
    
    SCRIPT_DIR="aicore0621/manus-task-manager/scripts"
    mkdir -p "$SCRIPT_DIR"
    
    # 主啟動腳本
    cat > "$SCRIPT_DIR/start.sh" << 'EOF'
#!/bin/bash

# Manus Task Manager 啟動腳本

cd "$(dirname "$0")/.."

echo "🚀 啟動 Manus Task Manager..."

# 檢查配置文件
if [ ! -f "src/config/config.js" ]; then
    echo "❌ 配置文件不存在，請先運行部署腳本"
    exit 1
fi

# 檢查數據庫
if [ ! -f "data/manus_tasks.db" ]; then
    echo "📊 初始化數據庫..."
    node scripts/init-db.js
fi

# 啟動應用
echo "🎯 啟動主應用..."
node src/manus_comprehensive_manager.js "$@"
EOF
    
    # TRAE啟動腳本
    cat > "$SCRIPT_DIR/start-trae.sh" << 'EOF'
#!/bin/bash

# TRAE 控制器啟動腳本

cd "$(dirname "$0")/.."

echo "🎯 啟動 TRAE 控制器..."
node src/trae-playwright-controller.js "$@"
EOF
    
    # 健康檢查腳本
    cat > "$SCRIPT_DIR/health-check.js" << 'EOF'
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function healthCheck() {
    console.log('🔍 系統健康檢查...\n');
    
    let issues = 0;
    
    // 檢查配置文件
    const configPath = path.join(__dirname, '../src/config/config.js');
    if (fs.existsSync(configPath)) {
        console.log('✅ 配置文件存在');
    } else {
        console.log('❌ 配置文件不存在');
        issues++;
    }
    
    // 檢查數據庫
    const dbPath = path.join(__dirname, '../data/manus_tasks.db');
    if (fs.existsSync(dbPath)) {
        console.log('✅ 數據庫文件存在');
        
        // 檢查數據庫連接
        const db = new sqlite3.Database(dbPath);
        db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'", (err, row) => {
            if (err) {
                console.log('❌ 數據庫連接失敗:', err.message);
                issues++;
            } else {
                console.log(`✅ 數據庫連接正常，包含 ${row.count} 個表`);
            }
            db.close();
        });
    } else {
        console.log('❌ 數據庫文件不存在');
        issues++;
    }
    
    // 檢查必要目錄
    const dirs = ['data', 'downloads', 'logs', 'temp'];
    dirs.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        if (fs.existsSync(dirPath)) {
            console.log(`✅ 目錄 ${dir} 存在`);
        } else {
            console.log(`❌ 目錄 ${dir} 不存在`);
            issues++;
        }
    });
    
    // 檢查Node.js模塊
    try {
        require('playwright');
        console.log('✅ Playwright 已安裝');
    } catch (e) {
        console.log('❌ Playwright 未安裝');
        issues++;
    }
    
    console.log(`\n📊 健康檢查完成，發現 ${issues} 個問題`);
    
    if (issues === 0) {
        console.log('🎉 系統狀態良好！');
        process.exit(0);
    } else {
        console.log('⚠️  請解決上述問題後重新運行');
        process.exit(1);
    }
}

healthCheck();
EOF
    
    # 設置執行權限
    chmod +x "$SCRIPT_DIR/start.sh"
    chmod +x "$SCRIPT_DIR/start-trae.sh"
    
    log_success "啟動腳本創建完成"
}

# 運行測試
run_tests() {
    log_info "運行系統測試..."
    
    cd aicore0621/manus-task-manager
    
    # 運行健康檢查
    node scripts/health-check.js
    
    cd ../..
    
    log_success "測試完成"
}

# 顯示完成信息
show_completion_info() {
    log_success "🎉 AICore0621 部署完成！"
    
    echo ""
    echo "📋 下一步操作："
    echo "1. 編輯配置文件: aicore0621/manus-task-manager/src/config/config.js"
    echo "2. 設置環境變量: aicore0621/manus-task-manager/.env"
    echo "3. 啟動系統:"
    echo "   cd aicore0621/manus-task-manager"
    echo "   bash scripts/start.sh"
    echo ""
    echo "📚 更多信息請查看文檔: aicore0621/docs/manus-task-manager-complete-guide.md"
    echo ""
}

# 主函數
main() {
    echo "🚀 AICore0621 自動部署腳本"
    echo "================================"
    echo ""
    
    check_requirements
    setup_project
    install_dependencies
    create_config
    create_directories
    setup_environment
    init_database
    create_startup_scripts
    run_tests
    show_completion_info
}

# 執行主函數
main "$@"
EOF

chmod +x /home/ubuntu/aicore0621/scripts/deploy.sh

