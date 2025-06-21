#!/usr/bin/env python3
"""
MCP Coordinator - 統一協調器
負責協調所有 MCP 適配器的數據流和交互
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import threading
from dataclasses import dataclass, asdict
from enum import Enum

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MCPStatus(Enum):
    """MCP 狀態枚舉"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    MAINTENANCE = "maintenance"

class DataType(Enum):
    """數據類型枚舉"""
    MANUS_CONVERSATION = "manus_conversation"
    TRAE_CODE_INTERACTION = "trae_code_interaction"
    CLOUD_EDGE_DATA = "cloud_edge_data"
    INTERACTION_LOG = "interaction_log"
    RL_SRT_DATA = "rl_srt_data"

@dataclass
class MCPAdapter:
    """MCP 適配器信息"""
    id: str
    name: str
    endpoint: str
    status: MCPStatus
    last_heartbeat: datetime
    data_types: List[DataType]
    metadata: Dict[str, Any]

@dataclass
class DataPacket:
    """數據包"""
    id: str
    source_mcp: str
    data_type: DataType
    content: Dict[str, Any]
    timestamp: datetime
    processed: bool = False

class MCPCoordinator:
    """MCP 協調器"""
    
    def __init__(self, db_path: str = "mcp_coordinator.db"):
        self.db_path = db_path
        self.adapters: Dict[str, MCPAdapter] = {}
        self.data_queue: List[DataPacket] = []
        self.init_database()
        
    def init_database(self):
        """初始化數據庫"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # MCP 適配器表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mcp_adapters (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                status TEXT NOT NULL,
                last_heartbeat TEXT NOT NULL,
                data_types TEXT NOT NULL,
                metadata TEXT
            )
        """)
        
        # 數據包表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS data_packets (
                id TEXT PRIMARY KEY,
                source_mcp TEXT NOT NULL,
                data_type TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                processed BOOLEAN DEFAULT FALSE
            )
        """)
        
        # Manus 數據表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS manus_data (
                id TEXT PRIMARY KEY,
                conversation_id TEXT,
                message_type TEXT,
                content TEXT,
                timestamp TEXT,
                metadata TEXT
            )
        """)
        
        # TRAE 數據表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trae_data (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                interaction_type TEXT,
                code_content TEXT,
                timestamp TEXT,
                metadata TEXT
            )
        """)
        
        conn.commit()
        conn.close()
        
    def register_adapter(self, adapter: MCPAdapter) -> bool:
        """註冊 MCP 適配器"""
        try:
            self.adapters[adapter.id] = adapter
            
            # 保存到數據庫
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO mcp_adapters 
                (id, name, endpoint, status, last_heartbeat, data_types, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                adapter.id,
                adapter.name,
                adapter.endpoint,
                adapter.status.value,
                adapter.last_heartbeat.isoformat(),
                json.dumps([dt.value for dt in adapter.data_types]),
                json.dumps(adapter.metadata)
            ))
            conn.commit()
            conn.close()
            
            logger.info(f"MCP 適配器已註冊: {adapter.name} ({adapter.id})")
            return True
            
        except Exception as e:
            logger.error(f"註冊 MCP 適配器失敗: {e}")
            return False
    
    def receive_data(self, data_packet: DataPacket) -> bool:
        """接收數據包"""
        try:
            self.data_queue.append(data_packet)
            
            # 保存到數據庫
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO data_packets 
                (id, source_mcp, data_type, content, timestamp, processed)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                data_packet.id,
                data_packet.source_mcp,
                data_packet.data_type.value,
                json.dumps(data_packet.content),
                data_packet.timestamp.isoformat(),
                data_packet.processed
            ))
            conn.commit()
            conn.close()
            
            # 根據數據類型進行特殊處理
            self._process_data_packet(data_packet)
            
            logger.info(f"數據包已接收: {data_packet.id} from {data_packet.source_mcp}")
            return True
            
        except Exception as e:
            logger.error(f"接收數據包失敗: {e}")
            return False
    
    def _process_data_packet(self, data_packet: DataPacket):
        """處理數據包"""
        if data_packet.data_type == DataType.MANUS_CONVERSATION:
            self._process_manus_data(data_packet)
        elif data_packet.data_type == DataType.TRAE_CODE_INTERACTION:
            self._process_trae_data(data_packet)
        elif data_packet.data_type == DataType.CLOUD_EDGE_DATA:
            self._process_cloud_edge_data(data_packet)
        elif data_packet.data_type == DataType.INTERACTION_LOG:
            self._process_interaction_log(data_packet)
        elif data_packet.data_type == DataType.RL_SRT_DATA:
            self._process_rl_srt_data(data_packet)
    
    def _process_manus_data(self, data_packet: DataPacket):
        """處理 Manus 數據"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            content = data_packet.content
            cursor.execute("""
                INSERT INTO manus_data 
                (id, conversation_id, message_type, content, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                data_packet.id,
                content.get('conversation_id'),
                content.get('message_type'),
                content.get('content'),
                data_packet.timestamp.isoformat(),
                json.dumps(content.get('metadata', {}))
            ))
            
            conn.commit()
            conn.close()
            logger.info(f"Manus 數據已處理: {data_packet.id}")
            
        except Exception as e:
            logger.error(f"處理 Manus 數據失敗: {e}")
    
    def _process_trae_data(self, data_packet: DataPacket):
        """處理 TRAE 數據"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            content = data_packet.content
            cursor.execute("""
                INSERT INTO trae_data 
                (id, session_id, interaction_type, code_content, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                data_packet.id,
                content.get('session_id'),
                content.get('interaction_type'),
                content.get('code_content'),
                data_packet.timestamp.isoformat(),
                json.dumps(content.get('metadata', {}))
            ))
            
            conn.commit()
            conn.close()
            logger.info(f"TRAE 數據已處理: {data_packet.id}")
            
        except Exception as e:
            logger.error(f"處理 TRAE 數據失敗: {e}")
    
    def _process_cloud_edge_data(self, data_packet: DataPacket):
        """處理雲邊緣數據"""
        logger.info(f"雲邊緣數據已處理: {data_packet.id}")
    
    def _process_interaction_log(self, data_packet: DataPacket):
        """處理交互日誌"""
        logger.info(f"交互日誌已處理: {data_packet.id}")
    
    def _process_rl_srt_data(self, data_packet: DataPacket):
        """處理強化學習數據"""
        logger.info(f"強化學習數據已處理: {data_packet.id}")
    
    def get_adapter_status(self) -> Dict[str, Any]:
        """獲取適配器狀態"""
        return {
            adapter_id: {
                'name': adapter.name,
                'status': adapter.status.value,
                'last_heartbeat': adapter.last_heartbeat.isoformat(),
                'data_types': [dt.value for dt in adapter.data_types]
            }
            for adapter_id, adapter in self.adapters.items()
        }
    
    def get_data_statistics(self) -> Dict[str, Any]:
        """獲取數據統計"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 統計各類型數據數量
        stats = {}
        for data_type in DataType:
            cursor.execute(
                "SELECT COUNT(*) FROM data_packets WHERE data_type = ?",
                (data_type.value,)
            )
            stats[data_type.value] = cursor.fetchone()[0]
        
        conn.close()
        return stats

# Flask 應用
app = Flask(__name__)
CORS(app)

# 全局協調器實例
coordinator = MCPCoordinator()

@app.route('/api/mcp/register', methods=['POST'])
def register_mcp():
    """註冊 MCP 適配器"""
    try:
        data = request.get_json()
        adapter = MCPAdapter(
            id=data['id'],
            name=data['name'],
            endpoint=data['endpoint'],
            status=MCPStatus(data.get('status', 'active')),
            last_heartbeat=datetime.now(),
            data_types=[DataType(dt) for dt in data.get('data_types', [])],
            metadata=data.get('metadata', {})
        )
        
        success = coordinator.register_adapter(adapter)
        return jsonify({'success': success})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/data/receive', methods=['POST'])
def receive_data():
    """接收數據包"""
    try:
        data = request.get_json()
        data_packet = DataPacket(
            id=data['id'],
            source_mcp=data['source_mcp'],
            data_type=DataType(data['data_type']),
            content=data['content'],
            timestamp=datetime.fromisoformat(data['timestamp'])
        )
        
        success = coordinator.receive_data(data_packet)
        return jsonify({'success': success})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/status', methods=['GET'])
def get_status():
    """獲取系統狀態"""
    return jsonify({
        'adapters': coordinator.get_adapter_status(),
        'data_statistics': coordinator.get_data_statistics(),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/manus/data', methods=['GET'])
def get_manus_data():
    """獲取 Manus 數據"""
    try:
        conn = sqlite3.connect(coordinator.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM manus_data 
            ORDER BY timestamp DESC 
            LIMIT 100
        """)
        
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        data = [dict(zip(columns, row)) for row in rows]
        
        conn.close()
        return jsonify({'success': True, 'data': data})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/trae/data', methods=['GET'])
def get_trae_data():
    """獲取 TRAE 數據"""
    try:
        conn = sqlite3.connect(coordinator.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM trae_data 
            ORDER BY timestamp DESC 
            LIMIT 100
        """)
        
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        data = [dict(zip(columns, row)) for row in rows]
        
        conn.close()
        return jsonify({'success': True, 'data': data})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    logger.info("MCP Coordinator 啟動中...")
    app.run(host='0.0.0.0', port=9000, debug=True)

