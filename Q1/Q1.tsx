import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Brain, User, AlertCircle } from 'lucide-react';

const AIHumanClassifier = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [features, setFeatures] = useState(null);

  const analyzeText = (inputText) => {
    if (!inputText.trim()) {
      setResult(null);
      setFeatures(null);
      return;
    }

    // 文本特徵分析
    const sentences = inputText.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    const words = inputText.split(/\s+/).filter(w => w.trim().length > 0);
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    
    // 計算各種特徵
    const features = {
      // 句子長度一致性（AI 傾向更一致）
      sentenceLengthVariance: calculateVariance(sentences.map(s => s.split(/\s+/).length)),
      
      // 平均句子長度
      avgSentenceLength: avgSentenceLength,
      
      // 詞彙多樣性（人類通常更高）
      vocabularyDiversity: calculateVocabularyDiversity(words),
      
      // 重複詞使用率（AI 可能更高）
      repetitionRate: calculateRepetitionRate(words),
      
      // 連接詞使用頻率
      conjunctionRate: calculateConjunctionRate(inputText),
      
      // 標點符號密度
      punctuationDensity: calculatePunctuationDensity(inputText),
      
      // 句子結構複雜度
      structuralComplexity: calculateStructuralComplexity(sentences)
    };

    // 基於特徵的評分系統
    let aiScore = 0;
    let humanScore = 0;

    // 1. 句子長度變異性（低變異 = 更像 AI）
    if (features.sentenceLengthVariance < 50) aiScore += 20;
    else if (features.sentenceLengthVariance > 150) humanScore += 20;
    else humanScore += 10;

    // 2. 詞彙多樣性（高多樣性 = 更像人類）
    if (features.vocabularyDiversity > 0.7) humanScore += 25;
    else if (features.vocabularyDiversity < 0.5) aiScore += 25;
    else aiScore += 10;

    // 3. 重複率（高重複 = 更像 AI）
    if (features.repetitionRate > 0.15) aiScore += 15;
    else if (features.repetitionRate < 0.08) humanScore += 15;
    else humanScore += 8;

    // 4. 連接詞使用（適中 = AI，極端 = 人類）
    if (features.conjunctionRate > 0.03 && features.conjunctionRate < 0.06) aiScore += 15;
    else humanScore += 10;

    // 5. 結構複雜度（過於規整 = AI）
    if (features.structuralComplexity < 0.3) aiScore += 15;
    else if (features.structuralComplexity > 0.6) humanScore += 15;
    else humanScore += 8;

    // 6. 平均句子長度（15-25 詞 = 典型 AI）
    if (avgSentenceLength >= 15 && avgSentenceLength <= 25) aiScore += 10;
    else if (avgSentenceLength < 10 || avgSentenceLength > 30) humanScore += 10;

    // 正規化分數
    const total = aiScore + humanScore;
    const aiPercentage = Math.round((aiScore / total) * 100);
    const humanPercentage = 100 - aiPercentage;

    setResult({ aiPercentage, humanPercentage });
    setFeatures(features);
  };

  const calculateVariance = (arr) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return variance;
  };

  const calculateVocabularyDiversity = (words) => {
    if (words.length === 0) return 0;
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    return uniqueWords.size / words.length;
  };

  const calculateRepetitionRate = (words) => {
    if (words.length === 0) return 0;
    const wordCounts = {};
    words.forEach(word => {
      const lower = word.toLowerCase();
      wordCounts[lower] = (wordCounts[lower] || 0) + 1;
    });
    const repeated = Object.values(wordCounts).filter(count => count > 1).length;
    return repeated / words.length;
  };

  const calculateConjunctionRate = (text) => {
    const conjunctions = ['and', 'but', 'or', 'so', 'yet', 'for', 'nor', 'however', 'therefore', 'moreover', '和', '但是', '或者', '所以', '然而', '因此'];
    let count = 0;
    conjunctions.forEach(conj => {
      const regex = new RegExp(`\\b${conj}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) count += matches.length;
    });
    return count / text.split(/\s+/).length;
  };

  const calculatePunctuationDensity = (text) => {
    const punctuation = text.match(/[,.!?;:，。！？；：]/g);
    return punctuation ? punctuation.length / text.length : 0;
  };

  const calculateStructuralComplexity = (sentences) => {
    if (sentences.length === 0) return 0;
    const lengths = sentences.map(s => s.length);
    const variance = calculateVariance(lengths);
    return Math.min(variance / 1000, 1);
  };

  const getConfidenceLevel = (percentage) => {
    if (percentage >= 70) return { text: '高信心度', color: 'text-green-600' };
    if (percentage >= 55) return { text: '中等信心度', color: 'text-yellow-600' };
    return { text: '低信心度', color: 'text-orange-600' };
  };

  const chartData = result ? [
    { name: 'AI 生成', percentage: result.aiPercentage },
    { name: '人類撰寫', percentage: result.humanPercentage }
  ] : [];

  const radarData = features ? [
    { feature: '詞彙多樣性', value: features.vocabularyDiversity * 100, fullMark: 100 },
    { feature: '結構複雜度', value: features.structuralComplexity * 100, fullMark: 100 },
    { feature: '句長一致性', value: Math.max(0, 100 - features.sentenceLengthVariance / 2), fullMark: 100 },
    { feature: '重複率', value: (1 - features.repetitionRate) * 100, fullMark: 100 },
    { feature: '連接詞使用', value: features.conjunctionRate * 1000, fullMark: 100 }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Brain className="text-blue-600" size={40} />
            AI vs Human 文章分類器
            <User className="text-green-600" size={40} />
          </h1>
          <p className="text-gray-600">輸入文本，即時判斷是由 AI 還是人類撰寫</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            輸入文本進行分析：
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              analyzeText(e.target.value);
            }}
            placeholder="請輸入至少 50 字的文本以獲得更準確的分析結果..."
            className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-gray-700"
          />
          <div className="mt-2 text-sm text-gray-500">
            字數：{text.length} | 建議至少 50 字
          </div>
        </div>

        {result && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="text-blue-600" />
                  分析結果
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="text-blue-600" size={32} />
                      <span className="text-lg font-semibold">AI 生成</span>
                    </div>
                    <span className="text-3xl font-bold text-blue-600">
                      {result.aiPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="text-green-600" size={32} />
                      <span className="text-lg font-semibold">人類撰寫</span>
                    </div>
                    <span className="text-3xl font-bold text-green-600">
                      {result.humanPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="text-yellow-600" size={20} />
                    <span className={`font-semibold ${getConfidenceLevel(Math.max(result.aiPercentage, result.humanPercentage)).color}`}>
                      {getConfidenceLevel(Math.max(result.aiPercentage, result.humanPercentage)).text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">比例圖表</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">文本特徵分析</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="feature" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="特徵分數" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-700">平均句子長度</div>
                    <div className="text-2xl font-bold text-blue-600">{features.avgSentenceLength.toFixed(1)} 詞</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-700">詞彙多樣性</div>
                    <div className="text-2xl font-bold text-blue-600">{(features.vocabularyDiversity * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-700">句長變異度</div>
                    <div className="text-2xl font-bold text-blue-600">{features.sentenceLengthVariance.toFixed(1)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-700">重複詞比率</div>
                    <div className="text-2xl font-bold text-blue-600">{(features.repetitionRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>提示：</strong>此分類器基於文本特徵分析，包括句子長度一致性、詞彙多樣性、重複率等指標。
                結果僅供參考，實際判斷需要更複雜的深度學習模型。建議輸入至少 100 字以獲得更準確的結果。
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIHumanClassifier;