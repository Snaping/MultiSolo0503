from recommendation.recommendation_service import RecommendationService
import json

def print_recommendations(recommendations, title):
    print(f"\n{'='*60}")
    print(f"{title}")
    print('='*60)
    print(f"{'Rank':<4} {'Symbol':<12} {'Name':<12} {'Score':<6} {'Reco':<8} {'Risk':<6}")
    print('-'*60)
    
    for i, rec in enumerate(recommendations, 1):
        print(f"{i:<4} {rec['symbol']:<12} {rec['name'][:12]:<12} {rec['score']:.2f}  {rec['recommendation'][:8]:<8} {rec['risk_level'][:6]:<6}")
        print(f"      Reason: {rec['reason']}")
        print()

def main():
    print("Welcome to Quant Trading Recommendation Tool")
    print("Based on VNPY Open Source Quant Trading Platform")
    print("-" * 40)
    
    service = RecommendationService()
    
    while True:
        print("\nPlease select an option:")
        print("1. Get Stock Recommendations")
        print("2. Get Fund Recommendations")
        print("3. Get Futures Recommendations")
        print("4. Get All Recommendations")
        print("5. Filter by Risk Level")
        print("6. Analyze Single Symbol")
        print("0. Exit")
        
        choice = input("Enter your choice: ")
        
        if choice == '1':
            recs = service.get_stock_recommendations(5)
            print_recommendations([r.to_dict() for r in recs], "Stock Recommendations")
        
        elif choice == '2':
            recs = service.get_fund_recommendations(5)
            print_recommendations([r.to_dict() for r in recs], "Fund Recommendations")
        
        elif choice == '3':
            recs = service.get_futures_recommendations(5)
            print_recommendations([r.to_dict() for r in recs], "Futures Recommendations")
        
        elif choice == '4':
            all_recs = service.get_all_recommendations(3)
            
            print("\n=== Stock Recommendations ===")
            for rec in all_recs['stocks']:
                print(f"{rec['symbol']} ({rec['name']}): {rec['recommendation']} (Score: {rec['score']:.2f})")
            
            print("\n=== Fund Recommendations ===")
            for rec in all_recs['funds']:
                print(f"{rec['symbol']} ({rec['name']}): {rec['recommendation']} (Score: {rec['score']:.2f})")
            
            print("\n=== Futures Recommendations ===")
            for rec in all_recs['futures']:
                print(f"{rec['symbol']} ({rec['name']}): {rec['recommendation']} (Score: {rec['score']:.2f})")
        
        elif choice == '5':
            risk_level = input("Enter risk level (low/medium/medium-high/high): ")
            risk_mapping = {
                'low': '低风险',
                'medium': '中风险', 
                'medium-high': '中高风险',
                'high': '高风险'
            }
            mapped_risk = risk_mapping.get(risk_level, risk_level)
            recs = service.get_recommendations_by_risk(mapped_risk, 5)
            print_recommendations(recs, f"{risk_level.capitalize()} Risk Recommendations")
        
        elif choice == '6':
            print("\nSelect symbol type:")
            print("1. Stock")
            print("2. Fund")
            print("3. Futures")
            
            type_choice = input("Enter type: ")
            
            if type_choice == '1':
                symbol = input("Enter stock symbol (e.g., AAPL): ")
                try:
                    rec = service.analyze_stock(symbol)
                    print(json.dumps(rec.to_dict(), ensure_ascii=False, indent=2))
                except Exception as e:
                    print(f"Analysis failed: {e}")
            
            elif type_choice == '2':
                code = input("Enter fund code (e.g., 161725): ")
                try:
                    rec = service.analyze_fund(code)
                    print(json.dumps(rec.to_dict(), ensure_ascii=False, indent=2))
                except Exception as e:
                    print(f"Analysis failed: {e}")
            
            elif type_choice == '3':
                symbol = input("Enter futures symbol (e.g., CL=F): ")
                try:
                    rec = service.analyze_futures(symbol)
                    print(json.dumps(rec.to_dict(), ensure_ascii=False, indent=2))
                except Exception as e:
                    print(f"Analysis failed: {e}")
        
        elif choice == '0':
            print("Thank you for using Quant Trading Recommendation Tool. Goodbye!")
            break
        
        else:
            print("Invalid option, please try again")

if __name__ == "__main__":
    main()