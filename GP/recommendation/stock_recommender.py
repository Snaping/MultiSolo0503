from .base import BaseRecommender, RecommendationResult
from vnpy_integration.data_provider import DataProvider
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
from typing import List, Dict, Any

class StockRecommender(BaseRecommender):
    def __init__(self):
        self.data_provider = DataProvider()
        self.model = self._build_model()
        self.scaler = StandardScaler()
        self.stock_universe = [
            'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META',
            'NVDA', 'TSLA', 'JPM', 'V', 'JNJ',
            'WMT', 'PG', 'MA', 'UNH', 'HD',
            'DIS', 'NFLX', 'BABA', 'TCEHY', 'PYPL'
        ]
    
    def _build_model(self):
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        return model
    
    def get_recommendations(self, limit: int = 10) -> List[RecommendationResult]:
        recommendations = []
        
        for symbol in self.stock_universe:
            try:
                result = self.analyze_symbol(symbol)
                recommendations.append(result)
            except Exception as e:
                print(f"Error analyzing {symbol}: {e}")
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
    
    def analyze_symbol(self, symbol: str) -> RecommendationResult:
        data = self.data_provider.get_stock_data(symbol)
        indicators = self.data_provider.calculate_indicators(data)
        
        factors = self._compute_factors(data, indicators)
        score = self._calculate_score(factors, self._get_weights())
        
        recommendation = self._get_recommendation_level(score)
        risk_level = self._get_risk_level(indicators['volatility'])
        reason = self._generate_reason(factors, indicators)
        
        return RecommendationResult(
            symbol=symbol,
            name=self._get_stock_name(symbol),
            score=score,
            recommendation=recommendation,
            reason=reason,
            risk_level=risk_level,
            data=indicators
        )
    
    def _compute_factors(self, df: pd.DataFrame, indicators: Dict[str, float]) -> Dict[str, float]:
        factors = {}
        
        close = df['Close'].iloc[-1]
        sma_50 = indicators['sma_50']
        sma_200 = indicators['sma_200']
        
        factors['trend_score'] = self._calculate_trend_score(close, sma_50, sma_200)
        factors['momentum_score'] = self._calculate_momentum_score(indicators['rsi'], indicators['macd'])
        factors['volatility_score'] = self._calculate_volatility_score(indicators['volatility'])
        factors['quality_score'] = self._calculate_quality_score(indicators['sharpe_ratio'], indicators['max_drawdown'])
        
        return factors
    
    def _calculate_trend_score(self, close: float, sma_50: float, sma_200: float) -> float:
        if close > sma_50 > sma_200:
            return 1.0
        elif close > sma_50 and sma_50 < sma_200:
            return 0.6
        elif close < sma_50 < sma_200:
            return 0.3
        else:
            return 0.1
    
    def _calculate_momentum_score(self, rsi: float, macd: float) -> float:
        rsi_score = 1.0 if 30 < rsi < 70 else 0.5 if rsi <= 30 else 0.3
        macd_score = 1.0 if macd > 0 else 0.4
        return (rsi_score + macd_score) / 2
    
    def _calculate_volatility_score(self, volatility: float) -> float:
        if volatility < 0.2:
            return 0.9
        elif volatility < 0.4:
            return 0.7
        elif volatility < 0.6:
            return 0.4
        else:
            return 0.2
    
    def _calculate_quality_score(self, sharpe_ratio: float, max_drawdown: float) -> float:
        sharpe_score = min(sharpe_ratio / 2, 1.0) if sharpe_ratio > 0 else 0.3
        drawdown_score = 1.0 + max_drawdown if max_drawdown < 0 else 0.5
        return (sharpe_score + drawdown_score) / 2
    
    def _get_weights(self) -> Dict[str, float]:
        return {
            'trend_score': 0.3,
            'momentum_score': 0.3,
            'volatility_score': 0.2,
            'quality_score': 0.2
        }
    
    def _generate_reason(self, factors: Dict[str, float], indicators: Dict[str, float]) -> str:
        reasons = []
        
        if factors['trend_score'] >= 0.6:
            reasons.append('均线多头排列')
        elif factors['trend_score'] < 0.3:
            reasons.append('均线空头排列')
        
        if factors['momentum_score'] >= 0.7:
            reasons.append('动量强劲')
        elif factors['momentum_score'] < 0.4:
            reasons.append('动量疲软')
        
        if indicators['rsi'] > 70:
            reasons.append('RSI超买')
        elif indicators['rsi'] < 30:
            reasons.append('RSI超卖')
        
        if factors['volatility_score'] >= 0.7:
            reasons.append('波动率较低')
        elif factors['volatility_score'] < 0.4:
            reasons.append('波动率较高')
        
        return '; '.join(reasons) if reasons else '综合评估'
    
    def _get_stock_name(self, symbol: str) -> str:
        names = {
            'AAPL': '苹果公司',
            'GOOGL': '谷歌',
            'MSFT': '微软',
            'AMZN': '亚马逊',
            'META': 'Meta',
            'NVDA': '英伟达',
            'TSLA': '特斯拉',
            'JPM': '摩根大通',
            'V': 'Visa',
            'JNJ': '强生',
            'WMT': '沃尔玛',
            'PG': '宝洁',
            'MA': '万事达',
            'UNH': '联合健康',
            'HD': '家得宝',
            'DIS': '迪士尼',
            'NFLX': '奈飞',
            'BABA': '阿里巴巴',
            'TCEHY': '腾讯',
            'PYPL': 'PayPal'
        }
        return names.get(symbol, symbol)