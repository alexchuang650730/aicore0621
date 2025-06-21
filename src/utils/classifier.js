// Manus任務管理系統 - 消息分類器

/**
 * 消息分類關鍵詞配置
 */
const CLASSIFICATION_KEYWORDS = {
    '思考': {
        primary: ['分析', '考慮', '評估', '判斷', '推理', '計劃', '策略', '設計'],
        secondary: ['我認為', '我覺得', '我想', '可能', '也許', '或許', '假設'],
        tertiary: ['思考', '想法', '觀點', '見解', '理論', '概念', '方案', '建議']
    },
    '觀察': {
        primary: ['發現', '注意到', '觀察', '檢測', '識別', '確認', '檢查', '監測'],
        secondary: ['我看到', '顯示', '出現', '結果', '狀態', '情況', '現象'],
        tertiary: ['確認意圖', '理解', '明白', '了解', '察覺', '記錄', '報告']
    },
    '行動': {
        primary: ['執行', '運行', '創建', '修改', '實施', '完成', '操作', '處理'],
        secondary: ['發送', '點擊', '開始', '啟動', '停止', '刪除', '更新', '安裝'],
        tertiary: ['配置', '部署', '測試', '調試', '優化', '建立', '設置', '調整']
    }
};

/**
 * 權重配置
 */
const KEYWORD_WEIGHTS = {
    primary: 3,
    secondary: 2,
    tertiary: 1
};

/**
 * 消息分類器類
 */
class MessageClassifier {
    constructor(customKeywords = null) {
        this.keywords = customKeywords || CLASSIFICATION_KEYWORDS;
        this.weights = KEYWORD_WEIGHTS;
    }

    /**
     * 對消息內容進行分類
     * @param {string} content - 消息內容
     * @returns {string} 分類結果
     */
    classify(content) {
        if (!content || typeof content !== 'string') {
            return '其他';
        }

        const text = content.toLowerCase().trim();
        const scores = this.calculateScores(text);
        
        return this.determineCategory(scores);
    }

    /**
     * 計算各分類的得分
     * @param {string} text - 處理後的文本
     * @returns {Object} 各分類得分
     */
    calculateScores(text) {
        const scores = { '思考': 0, '觀察': 0, '行動': 0 };
        
        for (const [category, keywordGroups] of Object.entries(this.keywords)) {
            for (const [level, keywords] of Object.entries(keywordGroups)) {
                const weight = this.weights[level] || 1;
                
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    const matches = this.countMatches(text, keywordLower);
                    scores[category] += matches * weight;
                }
            }
        }
        
        return scores;
    }

    /**
     * 計算關鍵詞在文本中的匹配次數
     * @param {string} text - 文本
     * @param {string} keyword - 關鍵詞
     * @returns {number} 匹配次數
     */
    countMatches(text, keyword) {
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }

    /**
     * 根據得分確定最終分類
     * @param {Object} scores - 各分類得分
     * @returns {string} 最終分類
     */
    determineCategory(scores) {
        const maxScore = Math.max(...Object.values(scores));
        
        if (maxScore === 0) {
            return '其他';
        }
        
        // 找到得分最高的分類
        const topCategories = Object.keys(scores).filter(key => scores[key] === maxScore);
        
        // 如果有多個分類得分相同，使用優先級規則
        if (topCategories.length > 1) {
            const priority = ['行動', '觀察', '思考'];
            for (const category of priority) {
                if (topCategories.includes(category)) {
                    return category;
                }
            }
        }
        
        return topCategories[0];
    }

    /**
     * 獲取詳細的分類分析
     * @param {string} content - 消息內容
     * @returns {Object} 詳細分析結果
     */
    analyzeDetailed(content) {
        if (!content || typeof content !== 'string') {
            return {
                category: '其他',
                confidence: 0,
                scores: { '思考': 0, '觀察': 0, '行動': 0 },
                matchedKeywords: []
            };
        }

        const text = content.toLowerCase().trim();
        const scores = this.calculateScores(text);
        const matchedKeywords = this.getMatchedKeywords(text);
        const category = this.determineCategory(scores);
        const confidence = this.calculateConfidence(scores, category);

        return {
            category,
            confidence,
            scores,
            matchedKeywords,
            originalText: content,
            processedText: text
        };
    }

    /**
     * 獲取匹配的關鍵詞
     * @param {string} text - 處理後的文本
     * @returns {Array} 匹配的關鍵詞列表
     */
    getMatchedKeywords(text) {
        const matched = [];
        
        for (const [category, keywordGroups] of Object.entries(this.keywords)) {
            for (const [level, keywords] of Object.entries(keywordGroups)) {
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    if (text.includes(keywordLower)) {
                        matched.push({
                            keyword,
                            category,
                            level,
                            weight: this.weights[level] || 1
                        });
                    }
                }
            }
        }
        
        return matched;
    }

    /**
     * 計算分類信心度
     * @param {Object} scores - 各分類得分
     * @param {string} category - 選定的分類
     * @returns {number} 信心度 (0-1)
     */
    calculateConfidence(scores, category) {
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        
        if (totalScore === 0) {
            return 0;
        }
        
        const categoryScore = scores[category] || 0;
        const confidence = categoryScore / totalScore;
        
        // 調整信心度，考慮絕對得分
        const adjustedConfidence = Math.min(confidence * (1 + Math.log10(categoryScore + 1) / 10), 1);
        
        return Math.round(adjustedConfidence * 100) / 100;
    }

    /**
     * 批量分類
     * @param {Array} messages - 消息列表
     * @returns {Array} 分類結果列表
     */
    classifyBatch(messages) {
        return messages.map(message => ({
            original: message,
            category: this.classify(message),
            analysis: this.analyzeDetailed(message)
        }));
    }

    /**
     * 添加自定義關鍵詞
     * @param {string} category - 分類名稱
     * @param {string} level - 權重級別
     * @param {Array} keywords - 關鍵詞列表
     */
    addKeywords(category, level, keywords) {
        if (!this.keywords[category]) {
            this.keywords[category] = {};
        }
        
        if (!this.keywords[category][level]) {
            this.keywords[category][level] = [];
        }
        
        this.keywords[category][level].push(...keywords);
    }

    /**
     * 移除關鍵詞
     * @param {string} category - 分類名稱
     * @param {string} level - 權重級別
     * @param {Array} keywords - 要移除的關鍵詞列表
     */
    removeKeywords(category, level, keywords) {
        if (this.keywords[category] && this.keywords[category][level]) {
            this.keywords[category][level] = this.keywords[category][level]
                .filter(keyword => !keywords.includes(keyword));
        }
    }

    /**
     * 獲取統計信息
     * @param {Array} messages - 消息列表
     * @returns {Object} 統計信息
     */
    getStatistics(messages) {
        const results = this.classifyBatch(messages);
        const stats = {
            total: results.length,
            categories: { '思考': 0, '觀察': 0, '行動': 0, '其他': 0 },
            averageConfidence: 0,
            topKeywords: {}
        };

        let totalConfidence = 0;
        const keywordCounts = {};

        results.forEach(result => {
            const category = result.category;
            stats.categories[category]++;
            totalConfidence += result.analysis.confidence;

            // 統計關鍵詞使用頻率
            result.analysis.matchedKeywords.forEach(match => {
                const key = `${match.category}:${match.keyword}`;
                keywordCounts[key] = (keywordCounts[key] || 0) + 1;
            });
        });

        stats.averageConfidence = results.length > 0 ? totalConfidence / results.length : 0;

        // 獲取使用最頻繁的關鍵詞
        stats.topKeywords = Object.entries(keywordCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, count]) => {
                obj[key] = count;
                return obj;
            }, {});

        return stats;
    }

    /**
     * 導出配置
     * @returns {Object} 當前配置
     */
    exportConfig() {
        return {
            keywords: this.keywords,
            weights: this.weights
        };
    }

    /**
     * 導入配置
     * @param {Object} config - 配置對象
     */
    importConfig(config) {
        if (config.keywords) {
            this.keywords = config.keywords;
        }
        if (config.weights) {
            this.weights = config.weights;
        }
    }
}

/**
 * 創建默認分類器實例
 * @returns {MessageClassifier} 分類器實例
 */
function createDefaultClassifier() {
    return new MessageClassifier();
}

/**
 * 快速分類函數（向後兼容）
 * @param {string} content - 消息內容
 * @returns {string} 分類結果
 */
function classifyMessage(content) {
    const classifier = createDefaultClassifier();
    return classifier.classify(content);
}

module.exports = {
    MessageClassifier,
    CLASSIFICATION_KEYWORDS,
    KEYWORD_WEIGHTS,
    createDefaultClassifier,
    classifyMessage
};

