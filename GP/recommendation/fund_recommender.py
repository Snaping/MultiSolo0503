from .base import BaseRecommender, RecommendationResult
from vnpy_integration.data_provider import DataProvider
import pandas as pd
import numpy as np
from typing import List, Dict, Any

class FundRecommender(BaseRecommender):
    def __init__(self):
        self.data_provider = DataProvider()
        self.fund_universe = [
            '161725', '160225', '005918', '001593', '163406',
            '000001', '000336', '001838', '001410', '002943',
            '000962', '001878', '005827', '163115', '000697'
        ]
    
    def get_recommendations(self, limit: int = 10) -> List[RecommendationResult]:
        recommendations = []
        
        for fund_code in self.fund_universe:
            try:
                result = self.analyze_symbol(fund_code)
                recommendations.append(result)
            except Exception as e:
                print(f"Error analyzing fund {fund_code}: {e}")
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
    
    def analyze_symbol(self, fund_code: str) -> RecommendationResult:
        fund_data = self.data_provider.get_fund_data(fund_code)
        
        factors = self._compute_factors(fund_data)
        score = self._calculate_score(factors, self._get_weights())
        
        recommendation = self._get_recommendation_level(score)
        risk_level = self._determine_risk_level(fund_data)
        reason = self._generate_reason(factors, fund_data)
        
        return RecommendationResult(
            symbol=fund_code,
            name=fund_data.get('name', fund_code),
            score=score,
            recommendation=recommendation,
            reason=reason,
            risk_level=risk_level,
            data=fund_data
        )
    
    def _compute_factors(self, fund_data: Dict[str, Any]) -> Dict[str, float]:
        factors = {}
        
        fund_type = fund_data.get('type', '')
        
        factors['type_score'] = self._calculate_type_score(fund_type)
        factors['manager_score'] = self._calculate_manager_score(fund_data.get('manager', ''))
        factors['performance_score'] = self._calculate_performance_score(fund_data)
        factors['risk_score'] = self._calculate_risk_score(fund_data)
        
        return factors
    
    def _calculate_type_score(self, fund_type: str) -> float:
        type_scores = {
            '股票型': 0.8,
            '混合型': 0.7,
            '指数型': 0.75,
            '债券型': 0.6,
            '货币型': 0.5,
            'QDII': 0.7
        }
        return type_scores.get(fund_type, 0.5)
    
    def _calculate_manager_score(self, manager: str) -> float:
        if not manager:
            return 0.5
        return 0.7
    
    def _calculate_performance_score(self, fund_data: Dict[str, Any]) -> float:
        nav = fund_data.get('nav', 1.0)
        unit_net_worth = fund_data.get('unit_net_worth', 1.0)
        
        growth = (nav - unit_net_worth) / unit_net_worth if unit_net_worth > 0 else 0
        
        if growth > 0.3:
            return 1.0
        elif growth > 0.1:
            return 0.7
        elif growth > 0:
            return 0.5
        else:
            return 0.3
    
    def _calculate_risk_score(self, fund_data: Dict[str, Any]) -> float:
        fund_type = fund_data.get('type', '')
        
        risk_map = {
            '货币型': 0.9,
            '债券型': 0.8,
            '混合型': 0.6,
            '指数型': 0.5,
            '股票型': 0.4,
            'QDII': 0.5
        }
        return risk_map.get(fund_type, 0.5)
    
    def _get_weights(self) -> Dict[str, float]:
        return {
            'type_score': 0.25,
            'manager_score': 0.2,
            'performance_score': 0.35,
            'risk_score': 0.2
        }
    
    def _determine_risk_level(self, fund_data: Dict[str, Any]) -> str:
        fund_type = fund_data.get('type', '')
        
        risk_levels = {
            '货币型': '低风险',
            '债券型': '低风险',
            '混合型': '中风险',
            '指数型': '中高风险',
            '股票型': '高风险',
            'QDII': '高风险'
        }
        return risk_levels.get(fund_type, '中风险')
    
    def _generate_reason(self, factors: Dict[str, float], fund_data: Dict[str, Any]) -> str:
        reasons = []
        
        if factors['performance_score'] >= 0.7:
            reasons.append('近期表现优秀')
        elif factors['performance_score'] < 0.5:
            reasons.append('近期表现不佳')
        
        fund_type = fund_data.get('type', '')
        reasons.append(f'{fund_type}基金')
        
        if fund_data.get('manager'):
            reasons.append('由经验丰富的经理管理')
        
        return '; '.join(reasons) if reasons else '综合评估'