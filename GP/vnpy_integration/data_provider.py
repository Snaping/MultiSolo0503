import yfinance as yf
import pandas as pd
import numpy as np
from ta import add_all_ta_features
from ta.utils import dropna
from typing import Dict, Any, Optional
import requests

class DataProvider:
    def __init__(self):
        self.cache = {}
    
    def get_stock_data(self, symbol: str, period: str = '1y', interval: str = '1d') -> pd.DataFrame:
        cache_key = f"stock_{symbol}_{period}_{interval}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            data = yf.download(symbol, period=period, interval=interval)
            if data.empty:
                raise ValueError(f"No data found for symbol: {symbol}")
            
            data = add_all_ta_features(
                data,
                open="Open",
                high="High",
                low="Low",
                close="Close",
                volume="Volume",
                fillna=True
            )
            self.cache[cache_key] = data
            return data
        except Exception as e:
            raise ValueError(f"Failed to fetch stock data for {symbol}: {e}")
    
    def get_fund_data(self, fund_code: str) -> Dict[str, Any]:
        cache_key = f"fund_{fund_code}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            url = f"https://fund.eastmoney.com/pingzhongdata/{fund_code}.js"
            response = requests.get(url)
            if response.status_code != 200:
                raise ValueError(f"Failed to fetch fund data for {fund_code}")
            
            content = response.text
            data = {}
            
            if 'fS_name' in content:
                data['name'] = self._extract_value(content, 'fS_name')
            if 'fType' in content:
                data['type'] = self._extract_value(content, 'fType')
            if 'fManager' in content:
                data['manager'] = self._extract_value(content, 'fManager')
            if 'fEstimatedValue' in content:
                data['nav'] = float(self._extract_value(content, 'fEstimatedValue'))
            if 'fUnitNetWorth' in content:
                data['unit_net_worth'] = float(self._extract_value(content, 'fUnitNetWorth'))
            if 'fAccumulatedNetWorth' in content:
                data['accumulated_net_worth'] = float(self._extract_value(content, 'fAccumulatedNetWorth'))
            
            self.cache[cache_key] = data
            return data
        except Exception as e:
            raise ValueError(f"Failed to fetch fund data for {fund_code}: {e}")
    
    def get_futures_data(self, symbol: str, period: str = '1y', interval: str = '1d') -> pd.DataFrame:
        cache_key = f"futures_{symbol}_{period}_{interval}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            data = yf.download(symbol, period=period, interval=interval)
            if data.empty:
                raise ValueError(f"No data found for futures: {symbol}")
            
            data = add_all_ta_features(
                data,
                open="Open",
                high="High",
                low="Low",
                close="Close",
                volume="Volume",
                fillna=True
            )
            self.cache[cache_key] = data
            return data
        except Exception as e:
            raise ValueError(f"Failed to fetch futures data for {symbol}: {e}")
    
    def _extract_value(self, text: str, key: str) -> str:
        import re
        pattern = rf"{key}\s*=\s*['\"]([^'\"]+)['\"]"
        match = re.search(pattern, text)
        return match.group(1) if match else ""
    
    def calculate_indicators(self, df: pd.DataFrame) -> Dict[str, float]:
        indicators = {}
        
        indicators['rsi'] = df['momentum_rsi'].iloc[-1]
        indicators['macd'] = df['trend_macd'].iloc[-1]
        indicators['bollinger_high'] = df['volatility_bbh'].iloc[-1]
        indicators['bollinger_low'] = df['volatility_bbl'].iloc[-1]
        indicators['bollinger_mavg'] = df['volatility_bbm'].iloc[-1]
        indicators['sma_50'] = df['trend_sma_fast'].iloc[-1]
        indicators['sma_200'] = df['trend_sma_slow'].iloc[-1]
        indicators['adx'] = df['trend_adx'].iloc[-1]
        indicators['volume'] = df['Volume'].iloc[-1]
        
        recent_returns = df['Close'].pct_change().dropna()
        indicators['volatility'] = recent_returns.std() * np.sqrt(252)
        indicators['sharpe_ratio'] = (recent_returns.mean() / recent_returns.std()) * np.sqrt(252)
        indicators['max_drawdown'] = self._calculate_max_drawdown(df['Close'])
        
        return indicators
    
    def _calculate_max_drawdown(self, prices: pd.Series) -> float:
        peak = prices.cummax()
        drawdown = (prices - peak) / peak
        return drawdown.min()
    
    def clear_cache(self):
        self.cache.clear()