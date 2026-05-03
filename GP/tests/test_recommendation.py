import pytest
from recommendation.stock_recommender import StockRecommender
from recommendation.fund_recommender import FundRecommender
from recommendation.futures_recommender import FuturesRecommender
from recommendation.recommendation_service import RecommendationService

class TestStockRecommender:
    def test_get_recommendations(self):
        recommender = StockRecommender()
        recs = recommender.get_recommendations(5)
        assert len(recs) <= 5
        for rec in recs:
            assert 0 <= rec.score <= 1
            assert rec.symbol is not None
    
    def test_analyze_symbol(self):
        recommender = StockRecommender()
        rec = recommender.analyze_symbol('AAPL')
        assert rec.symbol == 'AAPL'
        assert 0 <= rec.score <= 1

class TestFundRecommender:
    def test_get_recommendations(self):
        recommender = FundRecommender()
        recs = recommender.get_recommendations(5)
        assert len(recs) <= 5
    
    def test_analyze_symbol(self):
        recommender = FundRecommender()
        rec = recommender.analyze_symbol('161725')
        assert rec.symbol == '161725'
        assert 0 <= rec.score <= 1

class TestFuturesRecommender:
    def test_get_recommendations(self):
        recommender = FuturesRecommender()
        recs = recommender.get_recommendations(5)
        assert len(recs) <= 5
    
    def test_analyze_symbol(self):
        recommender = FuturesRecommender()
        rec = recommender.analyze_symbol('CL=F')
        assert rec.symbol == 'CL=F'
        assert 0 <= rec.score <= 1

class TestRecommendationService:
    def test_get_all_recommendations(self):
        service = RecommendationService()
        recs = service.get_all_recommendations(3)
        assert 'stocks' in recs
        assert 'funds' in recs
        assert 'futures' in recs
        assert len(recs['stocks']) <= 3
        assert len(recs['funds']) <= 3
        assert len(recs['futures']) <= 3
    
    def test_get_recommendations_by_risk(self):
        service = RecommendationService()
        recs = service.get_recommendations_by_risk('低风险', 5)
        assert len(recs) <= 5
        for rec in recs:
            assert rec['risk_level'] == '低风险'