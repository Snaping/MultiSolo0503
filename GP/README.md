# 量化交易推荐工具

基于 VNPY 的开源量化交易平台，提供股票、基金、期货的智能推荐功能。

## 功能特性

- 股票推荐：基于技术指标和机器学习模型的股票选择
- 基金推荐：基金评级、风险评估和配置建议
- 期货推荐：期货合约分析和交易信号生成

## 安装

```bash
pip install -r requirements.txt
```

## 使用

```python
from recommendation.stock_recommender import StockRecommender
from recommendation.fund_recommender import FundRecommender
from recommendation.futures_recommender import FuturesRecommender

# 股票推荐
stock_recommender = StockRecommender()
recommendations = stock_recommender.get_recommendations()

# 基金推荐
fund_recommender = FundRecommender()
fund_recommendations = fund_recommender.get_recommendations()

# 期货推荐
futures_recommender = FuturesRecommender()
futures_recommendations = futures_recommender.get_recommendations()
```

## 项目结构

```
GP/
├── recommendation/
│   ├── __init__.py
│   ├── stock_recommender.py
│   ├── fund_recommender.py
│   ├── futures_recommender.py
│   └── base.py
├── data/
│   └── __init__.py
├── utils/
│   └── __init__.py
├── tests/
│   └── __init__.py
├── main.py
├── requirements.txt
└── pyproject.toml
```

## 许可证

MIT License