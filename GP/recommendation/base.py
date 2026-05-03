from abc import ABC, abstractmethod
from typing import List, Dict, Any

class RecommendationResult:
    def __init__(self, symbol: str, name: str, score: float, recommendation: str, 
                 reason: str, risk_level: str, data: Dict[str, Any] = None):
        self.symbol = symbol
        self.name = name
        self.score = score
        self.recommendation = recommendation
        self.reason = reason
        self.risk_level = risk_level
        self.data = data or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            'symbol': self.symbol,
            'name': self.name,
            'score': self.score,
            'recommendation': self.recommendation,
            'reason': self.reason,
            'risk_level': self.risk_level,
            'data': self.data
        }

class BaseRecommender(ABC):
    @abstractmethod
    def get_recommendations(self, limit: int = 10) -> List[RecommendationResult]:
        pass

    @abstractmethod
    def analyze_symbol(self, symbol: str) -> RecommendationResult:
        pass

    def _calculate_score(self, factors: Dict[str, float], weights: Dict[str, float]) -> float:
        score = 0.0
        total_weight = sum(weights.values())
        for factor, value in factors.items():
            score += value * weights.get(factor, 0)
        return score / total_weight if total_weight > 0 else 0.0

    def _get_recommendation_level(self, score: float) -> str:
        if score >= 0.8:
            return '强烈推荐'
        elif score >= 0.6:
            return '推荐'
        elif score >= 0.4:
            return '观望'
        else:
            return '不推荐'

    def _get_risk_level(self, volatility: float) -> str:
        if volatility < 0.2:
            return '低风险'
        elif volatility < 0.4:
            return '中风险'
        elif volatility < 0.6:
            return '中高风险'
        else:
            return '高风险'