// mac0620配置提取和整合
// 將mac0620的有用配置整合到aicore0621中

/**
 * 從mac0620提取的配置參數
 */
const MAC0620_CONFIG = {
    // 服務器配置
    server: {
        target_server: "18.212.97.173",
        target_directory: "/home/alexchuang/aiengine/trae/ec2/git",
        ssh_key_path: "~/.ssh/id_rsa",
        serveo_port: 41269
    },
    
    // GitHub配置
    github: {
        username: "alexchuang650730",
        repositories: [
            "mac0620",
            "aicore0621"
        ]
    },
    
    // Trae配置
    trae: {
        app_support_path: "/Users/alexchuang/Library/Application Support/Trae",
        check_interval: 30, // 秒
        log_file: "/tmp/trae_mcp_sync_mac.log"
    },
    
    // 監控配置
    monitoring: {
        check_interval: 30,
        retry_attempts: 3,
        timeout: 10000
    },
    
    // 同步配置
    sync: {
        script_path: "/home/alexchuang/aiengine/trae/ec2/sync_repositories.py",
        auto_sync: true,
        sync_on_change: true
    }
};

/**
 * 整合到aicore0621的配置結構
 */
const INTEGRATED_CONFIG = {
    // 基本配置（保持aicore0621的結構）
    baseDir: '/home/用戶名/manus',
    startUrl: 'https://manus.im/app/...',
    dbPath: '/path/to/database.db',
    
    // 新增：從mac0620整合的配置
    legacy: {
        // 服務器連接配置
        remoteServer: MAC0620_CONFIG.server,
        
        // GitHub整合配置
        github: MAC0620_CONFIG.github,
        
        // Trae應用配置
        trae: {
            ...MAC0620_CONFIG.trae,
            // 新增VS Code配置
            vscode: {
                executable_path: '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
                debug_port: 9222,
                workspace_dir: '/path/to/your/project'
            }
        },
        
        // 監控和同步配置
        monitoring: MAC0620_CONFIG.monitoring,
        sync: MAC0620_CONFIG.sync
    },
    
    // Playwright配置（增強版）
    playwright: {
        headless: false,
        timeout: 30000,
        viewport: { width: 1920, height: 1080 },
        
        // 新增：多重選擇器策略
        selectors: {
            // VS Code Trae插件選擇器
            vscode_trae: {
                input_box: [
                    'textarea[placeholder*="輸入"]',
                    'textarea[aria-label*="輸入"]',
                    '.monaco-editor textarea',
                    '[data-testid="chat-input"]'
                ],
                send_button: [
                    'button[title*="發送"]',
                    'button[aria-label*="發送"]',
                    '.send-button',
                    '[data-testid="send-button"]'
                ],
                chat_history: [
                    '.chat-history',
                    '.conversation-container',
                    '[data-testid="chat-messages"]'
                ]
            },
            
            // Manus網頁選擇器（保持原有）
            manus: {
                task_list: '.task-list',
                share_button: 'button:has-text("Share")',
                input_box: 'textarea[placeholder*="Type"]'
            }
        }
    }
};

module.exports = {
    MAC0620_CONFIG,
    INTEGRATED_CONFIG
};

