from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

try:
    from vnpy.app.cta_strategy import CtaStrategy, CtaEngine
    from vnpy.app.cta_backtester import BackTesterEngine
    from vnpy.trader.setting import SETTINGS
    from vnpy.trader.engine import MainEngine
    from vnpy.gateway import binance
    VNPY_AVAILABLE = True
except ImportError:
    VNPY_AVAILABLE = False
    logger.warning("VNPY modules not available, trading functionality will be limited")

class VnpyAdapter:
    def __init__(self):
        self.main_engine = None
        self.cta_engine = None
        self.backtester_engine = None
        self._initialized = False

    def initialize(self, config: Dict[str, Any] = None):
        if not VNPY_AVAILABLE:
            logger.error("VNPY is not available, cannot initialize")
            raise ImportError("VNPY modules not found")
        
        try:
            SETTINGS.set("log.active", True)
            SETTINGS.set("log.level", "INFO")
            SETTINGS.set("log.console", True)
            
            self.main_engine = MainEngine()
            self.main_engine.add_gateway(binance)
            
            self.cta_engine = self.main_engine.add_app(CtaEngine)
            self.backtester_engine = self.main_engine.add_app(BackTesterEngine)
            
            self._initialized = True
            logger.info("VNPY adapter initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize VNPY adapter: {e}")
            raise

    def get_account_balance(self) -> Dict[str, float]:
        if not VNPY_AVAILABLE:
            return {}
        
        if not self._initialized:
            self.initialize()
        
        accounts = self.main_engine.get_all_accounts()
        balance = {}
        for acc in accounts:
            balance[acc.currency] = acc.balance
        return balance

    def get_position(self) -> Dict[str, Any]:
        if not VNPY_AVAILABLE:
            return {}
        
        if not self._initialized:
            self.initialize()
        
        positions = self.main_engine.get_all_positions()
        result = {}
        for pos in positions:
            result[pos.vt_symbol] = {
                'direction': pos.direction.value,
                'volume': pos.volume,
                'price': pos.price,
                'pnl': pos.pnl
            }
        return result

    def send_order(self, symbol: str, direction: str, price: float, volume: float) -> str:
        if not VNPY_AVAILABLE:
            raise NotImplementedError("VNPY is not available")
        
        if not self._initialized:
            self.initialize()
        
        from vnpy.trader.object import OrderRequest, Direction, OrderType
        
        req = OrderRequest(
            symbol=symbol,
            exchange='BINANCE',
            direction=Direction(direction),
            type=OrderType.LIMIT,
            price=price,
            volume=volume
        )
        
        return self.main_engine.send_order(req)

    def run_backtest(self, strategy_class, strategy_name: str, 
                     vt_symbol: str, start_date, end_date, 
                     interval: str, capital: float = 100000) -> Dict[str, Any]:
        if not VNPY_AVAILABLE:
            raise NotImplementedError("VNPY is not available")
        
        if not self._initialized:
            self.initialize()
        
        result = self.backtester_engine.run_backtest(
            strategy_class,
            strategy_name,
            vt_symbol,
            start_date,
            end_date,
            interval,
            capital
        )
        return result

    def is_initialized(self) -> bool:
        return self._initialized
    
    def is_vnpy_available(self) -> bool:
        return VNPY_AVAILABLE