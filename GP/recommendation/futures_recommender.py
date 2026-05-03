from .base import BaseRecommender, RecommendationResult
from vnpy_integration.data_provider import DataProvider
import pandas as pd
import numpy as np
from typing import List, Dict, Any

class FuturesRecommender(BaseRecommender):
    def __init__(self):
        self.data_provider = DataProvider()
        self.futures_universe = [
            'CL=F', 'GC=F', 'SI=F', 'NG=F', 'ZC=F',
            'ES=F', 'NQ=F', 'YM=F', 'RTY=F', 'VX=F',
            'EUR=X', 'GBP=X', 'JPY=X', 'AUD=X', 'CAD=X'
        ]
    
    def get_recommendations(self, limit: int = 10) -> List[RecommendationResult]:
        recommendations = []
        
        for symbol in self.futures_universe:
            try:
                result = self.analyze_symbol(symbol)
                recommendations.append(result)
            except Exception as e:
                print(f"Error analyzing futures {symbol}: {e}")
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
    
    def analyze_symbol(self, symbol: str) -> RecommendationResult:
        data = self.data_provider.get_futures_data(symbol)
        indicators = self.data_provider.calculate_indicators(data)
        
        factors = self._compute_factors(data, indicators)
        score = self._calculate_score(factors, self._get_weights())
        
        recommendation = self._get_recommendation_level(score)
        risk_level = self._get_risk_level(indicators['volatility'])
        reason = self._generate_reason(factors, indicators)
        
        return RecommendationResult(
            symbol=symbol,
            name=self._get_futures_name(symbol),
            score=score,
            recommendation=recommendation,
            reason=reason,
            risk_level=risk_level,
            data=indicators
        )
    
    def _compute_factors(self, df: pd.DataFrame, indicators: Dict[str, float]) -> Dict[str, float]:
        factors = {}
        
        close = df['Close'].iloc[-1]
        bollinger_mavg = indicators['bollinger_mavg']
        bollinger_high = indicators['bollinger_high']
        bollinger_low = indicators['bollinger_low']
        
        factors['trend_score'] = self._calculate_trend_score(df)
        factors['momentum_score'] = self._calculate_momentum_score(indicators['rsi'], indicators['macd'])
        factors['volatility_score'] = self._calculate_volatility_score(indicators['volatility'])
        factors['bollinger_score'] = self._calculate_bollinger_score(close, bollinger_mavg, bollinger_high, bollinger_low)
        factors['volume_score'] = self._calculate_volume_score(df)
        
        return factors
    
    def _calculate_trend_score(self, df: pd.DataFrame) -> float:
        sma_50 = df['trend_sma_fast'].iloc[-1]
        sma_200 = df['trend_sma_slow'].iloc[-1]
        close = df['Close'].iloc[-1]
        
        if close > sma_50 > sma_200:
            return 1.0
        elif close > sma_50:
            return 0.7
        elif close > sma_200:
            return 0.5
        else:
            return 0.2
    
    def _calculate_momentum_score(self, rsi: float, macd: float) -> float:
        rsi_score = 1.0 if 40 < rsi < 60 else 0.7 if rsi <= 40 else 0.4
        macd_signal = df['trend_macd_signal'].iloc[-1] if 'trend_macd_signal' in df else 0
        macd_score = 1.0 if macd > macd_signal else 0.5
        return (rsi_score + macd_score) / 2
    
    def _calculate_volatility_score(self, volatility: float) -> float:
        if volatility < 0.3:
            return 0.8
        elif volatility < 0.5:
            return 0.6
        elif volatility < 0.7:
            return 0.4
        else:
            return 0.2
    
    def _calculate_bollinger_score(self, close: float, mavg: float, high: float, low: float) -> float:
        if low < close < mavg:
            return 0.8
        elif mavg < close < high:
            return 0.6
        elif close <= low:
            return 0.9
        elif close >= high:
            return 0.3
        else:
            return 0.5
    
    def _calculate_volume_score(self, df: pd.DataFrame) -> float:
        recent_volume = df['Volume'].iloc[-20:]
        avg_volume = df['Volume'].mean()
        
        if recent_volume.mean() > avg_volume * 1.5:
            return 0.9
        elif recent_volume.mean() > avg_volume:
            return 0.7
        else:
            return 0.5
    
    def _get_weights(self) -> Dict[str, float]:
        return {
            'trend_score': 0.25,
            'momentum_score': 0.25,
            'volatility_score': 0.15,
            'bollinger_score': 0.2,
            'volume_score': 0.15
        }
    
    def _generate_reason(self, factors: Dict[str, float], indicators: Dict[str, float]) -> str:
        reasons = []
        
        if factors['trend_score'] >= 0.7:
            reasons.append('趋势明确')
        elif factors['trend_score'] < 0.3:
            reasons.append('趋势走弱')
        
        if indicators['rsi'] > 70:
            reasons.append('超买信号')
        elif indicators['rsi'] < 30:
            reasons.append('超卖信号')
        
        if factors['bollinger_score'] >= 0.8:
            reasons.append('布林带低位')
        elif factors['bollinger_score'] < 0.4:
            reasons.append('布林带高位')
        
        if factors['volume_score'] >= 0.7:
            reasons.append('成交量活跃')
        
        return '; '.join(reasons) if reasons else '综合评估'
    
    def _get_futures_name(self, symbol: str) -> str:
        names = {
            'CL=F': '原油期货',
            'GC=F': '黄金期货',
            'SI=F': '白银期货',
            'NG=F': '天然气期货',
            'ZC=F': '玉米期货',
            'ES=F': '标普500期货',
            'NQ=F': '纳斯达克期货',
            'YM=F': '道琼斯期货',
            'RTY=F': '罗素2000期货',
            'VX=F': '波动率指数',
            'EUR=X': '欧元/美元',
            'GBP=X': '英镑/美元',
            'JPY=X': '日元/美元',
            'AUD=X': '澳元/美元',
            'CAD=X': '加元/美元'
        }
        return names.get(symbol, symbol)