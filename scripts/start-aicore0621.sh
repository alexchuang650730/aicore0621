#!/bin/bash
# aicore0621 啟動腳本
# 替代mac0620的AppleScript方案

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

# 檢查依賴
check_dependencies() {
    log_info "檢查系統依賴..."
    
    # 檢查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安裝，請先安裝Node.js"
        exit 1
    fi
    
    # 檢查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安裝，請先安裝npm"
        exit 1
    fi
    
    # 檢查VS Code
    if ! command -v code &> /dev/null; then
        log_warning "VS Code命令行工具未找到，請確保VS Code已正確安裝"
    fi
    
    log_success "依賴檢查完成"
}

# 檢查VS Code進程
check_vscode() {
    log_info "檢查VS Code狀態..."
    
    if pgrep -f "Visual Studio Code" > /dev/null; then
        log_success "VS Code正在運行"
        
        # 檢查是否以調試模式運行
        if pgrep -f "remote-debugging-port=9222" > /dev/null; then
            log_success "VS Code調試端口已開啟"
            return 0
        else
            log_warning "VS Code未以調試模式運行"
            return 1
        fi
    else
        log_warning "VS Code未運行"
        return 1
    fi
}

# 啟動VS Code
start_vscode() {
    log_info "啟動VS Code（調試模式）..."
    
    # 獲取工作目錄
    WORKSPACE_DIR=${1:-$(pwd)}
    
    # 啟動VS Code
    if command -v code &> /dev/null; then
        code --remote-debugging-port=9222 "$WORKSPACE_DIR" &
        log_success "VS Code已啟動，工作目錄: $WORKSPACE_DIR"
    else
        # macOS直接啟動
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open -a "Visual Studio Code" --args --remote-debugging-port=9222 "$WORKSPACE_DIR" &
            log_success "VS Code已啟動（macOS）"
        else
            log_error "無法啟動VS Code，請手動啟動"
            exit 1
        fi
    fi
    
    # 等待VS Code啟動
    log_info "等待VS Code啟動..."
    sleep 5
    
    # 驗證啟動
    if check_vscode; then
        log_success "VS Code啟動成功"
    else
        log_error "VS Code啟動失敗"
        exit 1
    fi
}

# 測試Trae VS Code控制器
test_trae_controller() {
    log_info "測試Trae VS Code控制器..."
    
    if npm run trae-vscode-test --silent; then
        log_success "Trae VS Code控制器測試通過"
    else
        log_error "Trae VS Code控制器測試失敗"
        return 1
    fi
}

# 啟動Manus任務管理器
start_manus_manager() {
    log_info "啟動Manus任務管理器..."
    
    # 檢查配置文件
    if [[ ! -f "src/config/config.js" ]]; then
        if [[ -f "src/config/config.migrated.js" ]]; then
            log_info "使用遷移後的配置文件"
            cp src/config/config.migrated.js src/config/config.js
        elif [[ -f "src/config/config.example.js" ]]; then
            log_warning "使用示例配置文件，請根據需要調整"
            cp src/config/config.example.js src/config/config.js
        else
            log_error "未找到配置文件"
            return 1
        fi
    fi
    
    # 啟動管理器
    log_success "Manus任務管理器準備就緒"
    log_info "使用 'npm start' 啟動完整的任務管理器"
}

# 顯示使用說明
show_usage() {
    echo "aicore0621 啟動腳本"
    echo ""
    echo "用法: $0 [選項] [工作目錄]"
    echo ""
    echo "選項:"
    echo "  -h, --help     顯示此幫助信息"
    echo "  -t, --test     僅測試連接，不啟動服務"
    echo "  -v, --verbose  詳細輸出"
    echo "  --no-vscode    跳過VS Code啟動"
    echo ""
    echo "示例:"
    echo "  $0                           # 使用當前目錄啟動"
    echo "  $0 /path/to/project         # 使用指定目錄啟動"
    echo "  $0 --test                   # 僅測試連接"
    echo ""
}

# 主函數
main() {
    local test_only=false
    local skip_vscode=false
    local workspace_dir=$(pwd)
    
    # 解析參數
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -t|--test)
                test_only=true
                shift
                ;;
            -v|--verbose)
                set -x
                shift
                ;;
            --no-vscode)
                skip_vscode=true
                shift
                ;;
            -*)
                log_error "未知選項: $1"
                show_usage
                exit 1
                ;;
            *)
                workspace_dir="$1"
                shift
                ;;
        esac
    done
    
    # 顯示歡迎信息
    echo "🚀 aicore0621 智能任務管理系統"
    echo "替代mac0620 AppleScript方案的現代化解決方案"
    echo ""
    
    # 檢查依賴
    check_dependencies
    
    # 檢查VS Code狀態
    if ! check_vscode && ! $skip_vscode; then
        start_vscode "$workspace_dir"
    fi
    
    # 測試Trae控制器
    if test_trae_controller; then
        log_success "✅ Trae VS Code控制器就緒"
    else
        log_error "❌ Trae VS Code控制器測試失敗"
        if ! $test_only; then
            log_info "請檢查VS Code和Trae插件狀態"
            exit 1
        fi
    fi
    
    # 如果只是測試，則退出
    if $test_only; then
        log_success "🎯 測試完成"
        exit 0
    fi
    
    # 啟動Manus管理器
    start_manus_manager
    
    # 顯示完成信息
    echo ""
    log_success "🎉 aicore0621系統啟動完成！"
    echo ""
    echo "📋 可用命令:"
    echo "  npm run trae-vscode-send \"消息\"    # 發送消息到Trae"
    echo "  npm run trae-vscode-history         # 提取對話歷史"
    echo "  npm run trae-vscode-screenshot      # 調試截圖"
    echo "  npm start                           # 啟動完整任務管理器"
    echo ""
    echo "📚 文檔: docs/migration-guide.md"
    echo "🐛 問題報告: https://github.com/alexchuang650730/aicore0621/issues"
    echo ""
}

# 執行主函數
main "$@"

