from .stock_recommender import StockRecommender
from .fund_recommender import FundRecommender
from .futures_recommender import FuturesRecommender
from .base import RecommendationResult
from typing import List, Dict, Any, Optional

class RecommendationService:
    def __init__(self):
        self.stock_recommender = StockRecommender()
        self.fund_recommender = FundRecommender()
        self.futures_recommender = FuturesRecommender()
    
    def get_stock_recommendations(self, limit: int = 10) -> List[RecommendationResult]:
        return self.stock_recommender.get_recommendations(limit)
    
    def get_fund_recommendations(self, limit: int = 10) -> List[RecommendationResult]:
        return self.fund_recommender.get_recommendations(limit)
    
    def get_futures_recommendations(self, limit: int = 10) -> List[RecommendationResult]:
        return self.futures_recommender.get_recommendations(limit)
    
    def get_all_recommendations(self, limit: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        stock_recs = self.stock_recommender.get_recommendations(limit)
        fund_recs = self.fund_recommender.get_recommendations(limit)
        futures_recs = self.futures_recommender.get_recommendations(limit)
        
        return {
            'stocks': [rec.to_dict() for rec in stock_recs],
            'funds': [rec.to_dict() for rec in fund_recs],
            'futures': [rec.to_dict() for rec in futures_recs]
        }
    
    def analyze_stock(self, symbol: str) -> RecommendationResult:
        return self.stock_recommender.analyze_symbol(symbol)
    
    def analyze_fund(self, fund_code: str) -> RecommendationResult:
        return self.fund_recommender.analyze_symbol(fund_code)
    
    def analyze_futures(self, symbol: str) -> RecommendationResult:
        return self.futures_recommender.analyze_symbol(symbol)
    
    def get_recommendations_by_risk(self, risk_level: str, limit: int = 10) -> List[Dict[str, Any]]:
        all_recs = []
        
        for rec in self.stock_recommender.get_recommendations(20):
            if rec.risk_level == risk_level:
                all_recs.append({'type': 'stock', **rec.to_dict()})
        
        for rec in self.fund_recommender.get_recommendations(20):
            if rec.risk_level == risk_level:
                all_recs.append({'type': 'fund', **rec.to_dict()})
        
        for rec in self.futures_recommender.get_recommendations(20):
            if rec.risk_level == risk_level:
                all_recs.append({'type': 'futures', **rec.to_dict()})
        
        all_recs.sort(key=lambda x: x['score'], reverse=True)
        return all_recs[:limit]