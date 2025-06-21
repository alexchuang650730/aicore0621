#!/usr/bin/env python3
"""
統一管理平台 - 修復版本
解決路由衝突和函數重複問題
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
import time
import json
import logging
from datetime import datetime
import asyncio
import aiohttp
import threading
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 服務配置
SERVICES = {
    'mcp_server': {'port': 5000, 'name': 'MCP Server', 'type': 'API'},
    'testing_flow': {'port': 5001, 'name': 'Testing Flow', 'type': 'Web'},
    'workflow_manager': {'port': 5002, 'name': 'Workflow Manager', 'type': 'API'},
    'data_processor': {'port': 5003, 'name': 'Data Processor', 'type': 'Service'},
    'message_sender': {'port': 5004, 'name': 'Message Sender', 'type': 'API'},
    'file_manager': {'port': 5005, 'name': 'File Manager', 'type': 'Web'},
    'system_monitor': {'port': 5006, 'name': 'System Monitor', 'type': 'Dashboard'}
}

def check_service_health(service_name, config):
    """檢查單個服務健康狀態"""
    try:
        start_time = time.time()
        url = f"http://localhost:{config['port']}"
        
        # 嘗試不同的健康檢查端點
        health_endpoints = ['/', '/health', '/status', '/api/health']
        
        for endpoint in health_endpoints:
            try:
                response = requests.get(f"{url}{endpoint}", timeout=5)
                response_time = round((time.time() - start_time) * 1000, 2)
                
                if response.status_code == 200:
                    return {
                        'name': config['name'],
                        'port': config['port'],
                        'type': config['type'],
                        'status': 'healthy',
                        'status_code': response.status_code,
                        'response_time': f"{response_time}ms",
                        'url': url,
                        'last_check': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }
            except:
                continue
                
        # 如果所有端點都失敗，返回離線狀態
        return {
            'name': config['name'],
            'port': config['port'],
            'type': config['type'],
            'status': 'offline',
            'status_code': 0,
            'response_time': 'N/A',
            'url': url,
            'last_check': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
    except Exception as e:
        logger.error(f"檢查服務 {service_name} 時發生錯誤: {str(e)}")
        return {
            'name': config['name'],
            'port': config['port'],
            'type': config['type'],
            'status': 'error',
            'status_code': 0,
            'response_time': 'Error',
            'url': f"http://localhost:{config['port']}",
            'error': str(e),
            'last_check': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

@app.route('/')
def index():
    """主頁面"""
    return render_template('admin_dashboard.html')

@app.route('/api/services/status')
def get_services_status():
    """獲取所有服務狀態 - 修復版本"""
    try:
        services_status = []
        
        # 使用線程池並行檢查所有服務
        with ThreadPoolExecutor(max_workers=len(SERVICES)) as executor:
            future_to_service = {
                executor.submit(check_service_health, name, config): name 
                for name, config in SERVICES.items()
            }
            
            for future in future_to_service:
                try:
                    service_status = future.result(timeout=10)
                    services_status.append(service_status)
                except Exception as e:
                    service_name = future_to_service[future]
                    logger.error(f"檢查服務 {service_name} 超時: {str(e)}")
                    services_status.append({
                        'name': SERVICES[service_name]['name'],
                        'port': SERVICES[service_name]['port'],
                        'type': SERVICES[service_name]['type'],
                        'status': 'timeout',
                        'status_code': 0,
                        'response_time': 'Timeout',
                        'url': f"http://localhost:{SERVICES[service_name]['port']}",
                        'error': 'Health check timeout',
                        'last_check': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
        
        # 計算統計信息
        total_services = len(services_status)
        healthy_services = len([s for s in services_status if s['status'] == 'healthy'])
        offline_services = total_services - healthy_services
        health_percentage = round((healthy_services / total_services) * 100, 1) if total_services > 0 else 0
        
        return jsonify({
            'services': services_status,
            'summary': {
                'total': total_services,
                'healthy': healthy_services,
                'offline': offline_services,
                'health_percentage': health_percentage
            },
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        logger.error(f"獲取服務狀態時發生錯誤: {str(e)}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }), 500

@app.route('/api/service/<service_name>/restart', methods=['POST'])
def restart_service(service_name):
    """重啟指定服務"""
    try:
        if service_name not in SERVICES:
            return jsonify({'error': f'服務 {service_name} 不存在'}), 404
            
        # 這裡可以添加實際的服務重啟邏輯
        # 目前返回模擬結果
        return jsonify({
            'message': f'服務 {service_name} 重啟請求已發送',
            'service': SERVICES[service_name]['name'],
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        logger.error(f"重啟服務 {service_name} 時發生錯誤: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/system/info')
def get_system_info():
    """獲取系統信息"""
    try:
        import psutil
        import platform
        
        return jsonify({
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except ImportError:
        return jsonify({
            'platform': 'Unknown',
            'python_version': 'Unknown',
            'cpu_percent': 0,
            'memory_percent': 0,
            'disk_percent': 0,
            'note': 'psutil not installed',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        logger.error(f"獲取系統信息時發生錯誤: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs/<service_name>')
def get_service_logs(service_name):
    """獲取服務日誌"""
    try:
        if service_name not in SERVICES:
            return jsonify({'error': f'服務 {service_name} 不存在'}), 404
            
        # 這裡可以添加實際的日誌讀取邏輯
        # 目前返回模擬日誌
        logs = [
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] INFO: 服務 {SERVICES[service_name]['name']} 正在運行",
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] INFO: 端口 {SERVICES[service_name]['port']} 監聽中",
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] INFO: 服務類型: {SERVICES[service_name]['type']}"
        ]
        
        return jsonify({
            'service': SERVICES[service_name]['name'],
            'logs': logs,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        logger.error(f"獲取服務 {service_name} 日誌時發生錯誤: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 統一管理平台啟動中...")
    print("📊 管理界面: http://localhost:9001")
    print("🔧 API端點: http://localhost:9001/api/services/status")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=9001, debug=True)

