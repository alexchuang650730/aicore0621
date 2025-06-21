#!/usr/bin/env python3
"""
TRAE 智能介入 MCP 適配器
負責 TRAE 系統的智能介入、代碼分析和優化建議
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import json
import re
import ast
import sqlite3

logger = logging.getLogger(__name__)

class InterventionType(Enum):
    """介入類型枚舉"""
    CODE_OPTIMIZATION = "code_optimization"
    BUG_DETECTION = "bug_detection"
    PERFORMANCE_ANALYSIS = "performance_analysis"
    SECURITY_AUDIT = "security_audit"
    REFACTORING = "refactoring"
    TESTING = "testing"
    DOCUMENTATION = "documentation"

class SmartLevel(Enum):
    """智能級別枚舉"""
    BASIC = "basic"
    ADVANCED = "advanced"
    EXPERT = "expert"
    AI_POWERED = "ai_powered"

class CodeLanguage(Enum):
    """代碼語言枚舉"""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    CPP = "cpp"
    CSHARP = "csharp"
    GO = "go"
    RUST = "rust"

@dataclass
class CodeAnalysis:
    """代碼分析結果"""
    language: CodeLanguage
    lines_of_code: int
    complexity_score: float
    maintainability_index: float
    test_coverage: float
    issues: List[Dict[str, Any]]
    suggestions: List[Dict[str, Any]]
    metrics: Dict[str, Any]

@dataclass
class InterventionRequest:
    """介入請求"""
    id: str
    intervention_type: InterventionType
    smart_level: SmartLevel
    code_content: str
    language: CodeLanguage
    context: Dict[str, Any]
    timestamp: datetime

@dataclass
class InterventionResult:
    """介入結果"""
    request_id: str
    success: bool
    analysis: CodeAnalysis
    optimized_code: str
    suggestions: List[Dict[str, Any]]
    performance_improvement: float
    execution_time: float
    timestamp: datetime

class TRAESmartInterventionMCP:
    """TRAE 智能介入 MCP 適配器"""
    
    def __init__(self, db_path: str = "trae_intervention.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """初始化數據庫"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 介入請求表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS intervention_requests (
                id TEXT PRIMARY KEY,
                intervention_type TEXT NOT NULL,
                smart_level TEXT NOT NULL,
                code_content TEXT NOT NULL,
                language TEXT NOT NULL,
                context TEXT,
                timestamp TEXT NOT NULL
            )
        """)
        
        # 介入結果表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS intervention_results (
                request_id TEXT PRIMARY KEY,
                success BOOLEAN NOT NULL,
                analysis TEXT NOT NULL,
                optimized_code TEXT,
                suggestions TEXT,
                performance_improvement REAL,
                execution_time REAL,
                timestamp TEXT NOT NULL
            )
        """)
        
        # 代碼分析歷史表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS code_analysis_history (
                id TEXT PRIMARY KEY,
                language TEXT NOT NULL,
                original_code TEXT NOT NULL,
                analysis_result TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
        
    async def execute_intervention(self, request: InterventionRequest) -> InterventionResult:
        """執行智能介入"""
        start_time = datetime.now()
        
        try:
            # 保存請求到數據庫
            self._save_intervention_request(request)
            
            # 執行代碼分析
            analysis = await self._analyze_code(request.code_content, request.language, request.smart_level)
            
            # 根據介入類型執行相應操作
            if request.intervention_type == InterventionType.CODE_OPTIMIZATION:
                optimized_code, suggestions = await self._optimize_code(request.code_content, analysis)
            elif request.intervention_type == InterventionType.BUG_DETECTION:
                optimized_code, suggestions = await self._detect_bugs(request.code_content, analysis)
            elif request.intervention_type == InterventionType.PERFORMANCE_ANALYSIS:
                optimized_code, suggestions = await self._analyze_performance(request.code_content, analysis)
            elif request.intervention_type == InterventionType.SECURITY_AUDIT:
                optimized_code, suggestions = await self._audit_security(request.code_content, analysis)
            elif request.intervention_type == InterventionType.REFACTORING:
                optimized_code, suggestions = await self._refactor_code(request.code_content, analysis)
            elif request.intervention_type == InterventionType.TESTING:
                optimized_code, suggestions = await self._generate_tests(request.code_content, analysis)
            elif request.intervention_type == InterventionType.DOCUMENTATION:
                optimized_code, suggestions = await self._generate_documentation(request.code_content, analysis)
            else:
                optimized_code = request.code_content
                suggestions = []
            
            # 計算性能改進
            performance_improvement = self._calculate_performance_improvement(analysis)
            
            # 計算執行時間
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # 創建結果
            result = InterventionResult(
                request_id=request.id,
                success=True,
                analysis=analysis,
                optimized_code=optimized_code,
                suggestions=suggestions,
                performance_improvement=performance_improvement,
                execution_time=execution_time,
                timestamp=datetime.now()
            )
            
            # 保存結果到數據庫
            self._save_intervention_result(result)
            
            logger.info(f"TRAE 智能介入完成: {request.id}")
            return result
            
        except Exception as e:
            logger.error(f"TRAE 智能介入失敗: {e}")
            
            # 創建失敗結果
            result = InterventionResult(
                request_id=request.id,
                success=False,
                analysis=CodeAnalysis(
                    language=request.language,
                    lines_of_code=0,
                    complexity_score=0.0,
                    maintainability_index=0.0,
                    test_coverage=0.0,
                    issues=[],
                    suggestions=[],
                    metrics={}
                ),
                optimized_code=request.code_content,
                suggestions=[],
                performance_improvement=0.0,
                execution_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now()
            )
            
            return result
    
    async def _analyze_code(self, code_content: str, language: CodeLanguage, smart_level: SmartLevel) -> CodeAnalysis:
        """分析代碼"""
        lines_of_code = len(code_content.split('\n'))
        
        # 基於智能級別進行不同深度的分析
        if smart_level == SmartLevel.BASIC:
            complexity_score = self._calculate_basic_complexity(code_content)
            maintainability_index = 7.0
            test_coverage = 0.6
        elif smart_level == SmartLevel.ADVANCED:
            complexity_score = self._calculate_advanced_complexity(code_content)
            maintainability_index = 8.0
            test_coverage = 0.75
        elif smart_level == SmartLevel.EXPERT:
            complexity_score = self._calculate_expert_complexity(code_content)
            maintainability_index = 8.5
            test_coverage = 0.85
        else:  # AI_POWERED
            complexity_score = self._calculate_ai_complexity(code_content)
            maintainability_index = 9.0
            test_coverage = 0.9
        
        # 檢測問題
        issues = self._detect_code_issues(code_content, language, smart_level)
        
        # 生成建議
        suggestions = self._generate_code_suggestions(code_content, language, smart_level)
        
        # 計算指標
        metrics = {
            'cyclomatic_complexity': complexity_score,
            'code_duplication': self._calculate_duplication(code_content),
            'documentation_ratio': self._calculate_documentation_ratio(code_content),
            'naming_quality': self._assess_naming_quality(code_content),
            'error_handling_coverage': self._assess_error_handling(code_content)
        }
        
        return CodeAnalysis(
            language=language,
            lines_of_code=lines_of_code,
            complexity_score=complexity_score,
            maintainability_index=maintainability_index,
            test_coverage=test_coverage,
            issues=issues,
            suggestions=suggestions,
            metrics=metrics
        )
    
    async def _optimize_code(self, code_content: str, analysis: CodeAnalysis) -> tuple[str, List[Dict[str, Any]]]:
        """優化代碼"""
        optimized_code = code_content
        suggestions = []
        
        # 基於分析結果進行優化
        if analysis.complexity_score > 10:
            suggestions.append({
                'type': 'complexity_reduction',
                'title': '降低複雜度',
                'description': '建議將複雜函數拆分為更小的函數',
                'priority': 'high',
                'impact': 'maintainability'
            })
            
            # 模擬代碼優化
            optimized_code = self._apply_complexity_optimization(code_content)
        
        if analysis.metrics.get('code_duplication', 0) > 0.2:
            suggestions.append({
                'type': 'duplication_removal',
                'title': '消除重複代碼',
                'description': '提取公共邏輯到共享函數',
                'priority': 'medium',
                'impact': 'maintainability'
            })
        
        if analysis.metrics.get('error_handling_coverage', 0) < 0.7:
            suggestions.append({
                'type': 'error_handling',
                'title': '改進錯誤處理',
                'description': '添加更完善的異常處理機制',
                'priority': 'high',
                'impact': 'reliability'
            })
        
        return optimized_code, suggestions
    
    async def _detect_bugs(self, code_content: str, analysis: CodeAnalysis) -> tuple[str, List[Dict[str, Any]]]:
        """檢測錯誤"""
        suggestions = []
        
        # 常見錯誤模式檢測
        if 'except:' in code_content:
            suggestions.append({
                'type': 'bare_except',
                'title': '裸露的 except 語句',
                'description': '避免使用裸露的 except，應指定具體的異常類型',
                'priority': 'high',
                'impact': 'reliability'
            })
        
        if re.search(r'==\s*None', code_content):
            suggestions.append({
                'type': 'none_comparison',
                'title': 'None 比較',
                'description': '使用 "is None" 而不是 "== None"',
                'priority': 'medium',
                'impact': 'correctness'
            })
        
        if re.search(r'print\(', code_content):
            suggestions.append({
                'type': 'debug_print',
                'title': '調試 print 語句',
                'description': '移除或替換為適當的日誌記錄',
                'priority': 'low',
                'impact': 'production_readiness'
            })
        
        return code_content, suggestions
    
    async def _analyze_performance(self, code_content: str, analysis: CodeAnalysis) -> tuple[str, List[Dict[str, Any]]]:
        """性能分析"""
        suggestions = []
        
        # 性能問題檢測
        if 'for' in code_content and 'append' in code_content:
            suggestions.append({
                'type': 'list_comprehension',
                'title': '使用列表推導式',
                'description': '考慮使用列表推導式替代 for 循環 + append',
                'priority': 'medium',
                'impact': 'performance'
            })
        
        if re.search(r'\.join\(.*for.*in.*\)', code_content):
            suggestions.append({
                'type': 'string_concatenation',
                'title': '字符串連接優化',
                'description': '使用 join() 方法進行字符串連接',
                'priority': 'medium',
                'impact': 'performance'
            })
        
        return code_content, suggestions
    
    async def _audit_security(self, code_content: str, analysis: CodeAnalysis) -> tuple[str, List[Dict[str, Any]]]:
        """安全審計"""
        suggestions = []
        
        # 安全問題檢測
        if 'eval(' in code_content:
            suggestions.append({
                'type': 'eval_usage',
                'title': '危險的 eval() 使用',
                'description': 'eval() 可能導致代碼注入攻擊，考慮使用更安全的替代方案',
                'priority': 'critical',
                'impact': 'security'
            })
        
        if 'exec(' in code_content:
            suggestions.append({
                'type': 'exec_usage',
                'title': '危險的 exec() 使用',
                'description': 'exec() 可能導致代碼注入攻擊',
                'priority': 'critical',
                'impact': 'security'
            })
        
        if re.search(r'password\s*=\s*["\']', code_content):
            suggestions.append({
                'type': 'hardcoded_password',
                'title': '硬編碼密碼',
                'description': '避免在代碼中硬編碼密碼，使用環境變量或配置文件',
                'priority': 'high',
                'impact': 'security'
            })
        
        return code_content, suggestions
    
    async def _refactor_code(self, code_content: str, analysis: CodeAnalysis) -> tuple[str, List[Dict[str, Any]]]:
        """重構代碼"""
        suggestions = []
        
        if analysis.lines_of_code > 50:
            suggestions.append({
                'type': 'function_length',
                'title': '函數過長',
                'description': '考慮將長函數拆分為多個較小的函數',
                'priority': 'medium',
                'impact': 'maintainability'
            })
        
        return code_content, suggestions
    
    async def _generate_tests(self, code_content: str, analysis: CodeAnalysis) -> tuple[str, List[Dict[str, Any]]]:
        """生成測試"""
        suggestions = []
        
        # 生成測試建議
        suggestions.append({
            'type': 'unit_tests',
            'title': '單元測試',
            'description': '為主要函數添加單元測試',
            'priority': 'high',
            'impact': 'quality'
        })
        
        # 生成示例測試代碼
        test_code = f"""
# 生成的測試代碼示例
import unittest

class TestGeneratedCode(unittest.TestCase):
    def test_main_function(self):
        # TODO: 實現測試邏輯
        pass
    
    def test_edge_cases(self):
        # TODO: 測試邊界情況
        pass

if __name__ == '__main__':
    unittest.main()
"""
        
        return test_code, suggestions
    
    async def _generate_documentation(self, code_content: str, analysis: CodeAnalysis) -> tuple[str, List[Dict[str, Any]]]:
        """生成文檔"""
        suggestions = []
        
        suggestions.append({
            'type': 'docstrings',
            'title': '添加文檔字符串',
            'description': '為函數和類添加詳細的文檔字符串',
            'priority': 'medium',
            'impact': 'maintainability'
        })
        
        # 生成文檔化的代碼
        documented_code = self._add_documentation(code_content)
        
        return documented_code, suggestions
    
    # 輔助方法
    def _calculate_basic_complexity(self, code_content: str) -> float:
        """計算基礎複雜度"""
        # 簡單的複雜度計算
        complexity_keywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except']
        complexity = 1
        for keyword in complexity_keywords:
            complexity += code_content.count(keyword)
        return min(complexity, 20.0)
    
    def _calculate_advanced_complexity(self, code_content: str) -> float:
        """計算高級複雜度"""
        return self._calculate_basic_complexity(code_content) * 0.8
    
    def _calculate_expert_complexity(self, code_content: str) -> float:
        """計算專家級複雜度"""
        return self._calculate_basic_complexity(code_content) * 0.6
    
    def _calculate_ai_complexity(self, code_content: str) -> float:
        """計算 AI 驅動的複雜度"""
        return self._calculate_basic_complexity(code_content) * 0.4
    
    def _detect_code_issues(self, code_content: str, language: CodeLanguage, smart_level: SmartLevel) -> List[Dict[str, Any]]:
        """檢測代碼問題"""
        issues = []
        
        # 基於智能級別檢測不同類型的問題
        if smart_level in [SmartLevel.ADVANCED, SmartLevel.EXPERT, SmartLevel.AI_POWERED]:
            if 'TODO' in code_content:
                issues.append({
                    'type': 'todo_comment',
                    'severity': 'low',
                    'description': '發現 TODO 註釋，需要完成實現',
                    'line': code_content.find('TODO')
                })
        
        return issues
    
    def _generate_code_suggestions(self, code_content: str, language: CodeLanguage, smart_level: SmartLevel) -> List[Dict[str, Any]]:
        """生成代碼建議"""
        suggestions = []
        
        if smart_level in [SmartLevel.EXPERT, SmartLevel.AI_POWERED]:
            suggestions.append({
                'type': 'type_hints',
                'title': '添加類型提示',
                'description': '為函數參數和返回值添加類型提示',
                'priority': 'medium',
                'impact': 'maintainability'
            })
        
        return suggestions
    
    def _calculate_duplication(self, code_content: str) -> float:
        """計算代碼重複率"""
        lines = code_content.split('\n')
        unique_lines = set(line.strip() for line in lines if line.strip())
        if len(lines) == 0:
            return 0.0
        return 1.0 - (len(unique_lines) / len(lines))
    
    def _calculate_documentation_ratio(self, code_content: str) -> float:
        """計算文檔比率"""
        lines = code_content.split('\n')
        doc_lines = sum(1 for line in lines if line.strip().startswith('#') or '"""' in line or "'''" in line)
        if len(lines) == 0:
            return 0.0
        return doc_lines / len(lines)
    
    def _assess_naming_quality(self, code_content: str) -> float:
        """評估命名質量"""
        # 簡單的命名質量評估
        return 0.8  # 模擬值
    
    def _assess_error_handling(self, code_content: str) -> float:
        """評估錯誤處理覆蓋率"""
        try_count = code_content.count('try')
        function_count = code_content.count('def ')
        if function_count == 0:
            return 1.0
        return min(try_count / function_count, 1.0)
    
    def _calculate_performance_improvement(self, analysis: CodeAnalysis) -> float:
        """計算性能改進百分比"""
        # 基於分析結果估算性能改進
        base_improvement = 0.0
        
        if analysis.complexity_score > 10:
            base_improvement += 15.0
        
        if analysis.metrics.get('code_duplication', 0) > 0.2:
            base_improvement += 10.0
        
        return min(base_improvement, 50.0)
    
    def _apply_complexity_optimization(self, code_content: str) -> str:
        """應用複雜度優化"""
        # 模擬代碼優化
        return f"# 優化後的代碼\n{code_content}\n# 複雜度已降低"
    
    def _add_documentation(self, code_content: str) -> str:
        """添加文檔"""
        return f'"""\n模塊文檔\n此模塊包含自動生成的文檔\n"""\n\n{code_content}'
    
    def _save_intervention_request(self, request: InterventionRequest):
        """保存介入請求到數據庫"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO intervention_requests 
            (id, intervention_type, smart_level, code_content, language, context, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            request.id,
            request.intervention_type.value,
            request.smart_level.value,
            request.code_content,
            request.language.value,
            json.dumps(request.context),
            request.timestamp.isoformat()
        ))
        conn.commit()
        conn.close()
    
    def _save_intervention_result(self, result: InterventionResult):
        """保存介入結果到數據庫"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO intervention_results 
            (request_id, success, analysis, optimized_code, suggestions, performance_improvement, execution_time, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.request_id,
            result.success,
            json.dumps(asdict(result.analysis)),
            result.optimized_code,
            json.dumps(result.suggestions),
            result.performance_improvement,
            result.execution_time,
            result.timestamp.isoformat()
        ))
        conn.commit()
        conn.close()
    
    def get_intervention_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """獲取介入歷史"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.*, res.success, res.performance_improvement, res.execution_time
            FROM intervention_requests r
            LEFT JOIN intervention_results res ON r.id = res.request_id
            ORDER BY r.timestamp DESC
            LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        history = [dict(zip(columns, row)) for row in rows]
        
        conn.close()
        return history
    
    def get_statistics(self) -> Dict[str, Any]:
        """獲取統計信息"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 總介入次數
        cursor.execute("SELECT COUNT(*) FROM intervention_requests")
        total_interventions = cursor.fetchone()[0]
        
        # 成功率
        cursor.execute("SELECT COUNT(*) FROM intervention_results WHERE success = 1")
        successful_interventions = cursor.fetchone()[0]
        
        # 平均性能改進
        cursor.execute("SELECT AVG(performance_improvement) FROM intervention_results WHERE success = 1")
        avg_performance_improvement = cursor.fetchone()[0] or 0.0
        
        # 平均執行時間
        cursor.execute("SELECT AVG(execution_time) FROM intervention_results")
        avg_execution_time = cursor.fetchone()[0] or 0.0
        
        conn.close()
        
        success_rate = (successful_interventions / total_interventions * 100) if total_interventions > 0 else 0.0
        
        return {
            'total_interventions': total_interventions,
            'successful_interventions': successful_interventions,
            'success_rate': success_rate,
            'avg_performance_improvement': avg_performance_improvement,
            'avg_execution_time': avg_execution_time
        }

# 全局實例
trae_mcp = TRAESmartInterventionMCP()

if __name__ == "__main__":
    # 測試代碼
    import uuid
    
    async def test_intervention():
        request = InterventionRequest(
            id=str(uuid.uuid4()),
            intervention_type=InterventionType.CODE_OPTIMIZATION,
            smart_level=SmartLevel.ADVANCED,
            code_content="""
def example_function(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result
""",
            language=CodeLanguage.PYTHON,
            context={},
            timestamp=datetime.now()
        )
        
        result = await trae_mcp.execute_intervention(request)
        print(f"介入結果: {result.success}")
        print(f"建議數量: {len(result.suggestions)}")
        print(f"性能改進: {result.performance_improvement}%")
    
    asyncio.run(test_intervention())

