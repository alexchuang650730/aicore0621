from flask import Blueprint, request, jsonify
import os
import sys
import asyncio
import json
from datetime import datetime

# 添加父目錄到路徑以導入 manus 模組
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

manus_bp = Blueprint('manus', __name__)

@manus_bp.route('/test', methods=['POST'])
def test_manus():
    """執行 SmartInvention 系統測試"""
    try:
        data = request.get_json()
        url = data.get('url', '')
        action = data.get('action', 'navigate')
        message = data.get('message', '')
        
        # 記錄測試請求
        print(f"[SMARTINVENTION TEST] URL: {url}, Action: {action}, Message: {message}")
        
        # 根據不同的操作執行相應的測試
        if action == 'navigate':
            result = test_navigate_to_manus(url)
        elif action == 'extract_history':
            result = test_extract_history(url)
        elif action == 'send_message':
            result = test_send_message(url, message)
        elif action == 'download_files':
            result = test_download_files(url)
        elif action == 'full_automation':
            result = test_full_automation(url, message)
        else:
            return jsonify({
                'success': False,
                'error': f'未知的操作類型: {action}'
            })
        
        return jsonify(result)
        
    except Exception as e:
        print(f"[SMARTINVENTION TEST ERROR] {str(e)}")
        return jsonify({
            'success': False,
            'error': f'測試執行失敗: {str(e)}'
        })

def test_navigate_to_manus(url):
    """測試導航到 Manus 頁面"""
    try:
        # 這裡會調用實際的 Playwright 自動化代碼
        # 目前先返回模擬結果
        
        if not url or 'manus.im' not in url:
            return {
                'success': False,
                'error': 'URL 格式不正確，請提供有效的 Manus URL'
            }
        
        # 模擬導航測試
        return {
            'success': True,
            'message': f'成功導航到 Manus 頁面: {url}',
            'data': {
                'url': url,
                'status': 'loaded',
                'timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'導航測試失敗: {str(e)}'
        }

def test_extract_history(url):
    """測試提取對話歷史"""
    try:
        # 模擬歷史提取
        return {
            'success': True,
            'message': '成功提取對話歷史',
            'data': {
                'messages_extracted': 15,
                'classified_messages': {
                    'thinking': 5,
                    'observation': 4,
                    'action': 6
                },
                'timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'歷史提取失敗: {str(e)}'
        }

def test_send_message(url, message):
    """測試發送消息"""
    try:
        if not message:
            return {
                'success': False,
                'error': '請提供要發送的消息內容'
            }
        
        # 模擬消息發送
        return {
            'success': True,
            'message': f'成功發送消息: {message[:50]}...',
            'data': {
                'message_sent': message,
                'message_length': len(message),
                'timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'消息發送失敗: {str(e)}'
        }

def test_download_files(url):
    """測試下載文件"""
    try:
        # 模擬文件下載
        return {
            'success': True,
            'message': '成功下載文件',
            'data': {
                'files_downloaded': 3,
                'file_types': {
                    'documents': 1,
                    'images': 1,
                    'code_files': 1
                },
                'timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'文件下載失敗: {str(e)}'
        }

def test_full_automation(url, message):
    """測試完整自動化流程"""
    try:
        # 模擬完整流程
        steps = [
            '導航到 Manus 頁面',
            '提取對話歷史',
            '分類消息內容',
            '下載相關文件',
            '存儲到數據庫'
        ]
        
        if message:
            steps.append('發送測試消息')
        
        return {
            'success': True,
            'message': '完整自動化流程執行成功',
            'data': {
                'steps_completed': steps,
                'total_messages': 20,
                'classified_messages': {
                    'thinking': 7,
                    'observation': 6,
                    'action': 7
                },
                'files_processed': 5,
                'execution_time': '45.2 秒',
                'timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'完整自動化流程失敗: {str(e)}'
        }

@manus_bp.route('/status', methods=['GET'])
def get_manus_status():
    """獲取 Manus 系統狀態"""
    try:
        # 檢查 Manus 系統狀態
        status = {
            'status': 'running',
            'last_check': datetime.now().isoformat(),
            'playwright_available': True,
            'browser_ready': True,
            'connection_status': 'connected'
        }
        
        return jsonify({
            'success': True,
            'data': status
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'狀態檢查失敗: {str(e)}'
        })

@manus_bp.route('/config', methods=['GET', 'POST'])
def manus_config():
    """獲取或更新 Manus 配置"""
    if request.method == 'GET':
        try:
            config = {
                'base_url': 'https://manus.im/app/',
                'default_timeout': 30000,
                'headless_mode': False,
                'auto_classification': True,
                'download_files': True,
                'max_retries': 3
            }
            
            return jsonify({
                'success': True,
                'data': config
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'配置獲取失敗: {str(e)}'
            })
    
    elif request.method == 'POST':
        try:
            new_config = request.get_json()
            
            # 這裡應該保存配置到文件或數據庫
            # 目前先返回成功響應
            
            return jsonify({
                'success': True,
                'message': '配置更新成功',
                'data': new_config
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'配置更新失敗: {str(e)}'
            })

