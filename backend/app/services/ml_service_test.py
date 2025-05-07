from app.services.ml_service import forecast_demand, recommend_restock
from app.models.inventory import Product
import json
import pandas as pd
import matplotlib.pyplot as plt
import os

# Sample product data for testing
def create_test_product():
    # Convert historical sales to the format expected by the ML service
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, '..', '..', 'data', 'inventory_data.csv')
    df = pd.read_csv(data_path)
    sample_row = df.iloc[0]  # Get first product
    
    historical_sales = eval(sample_row['historical_sales'])
    
    product = Product(
        id=sample_row['product_id'],
        name=sample_row['name'],
        category=sample_row['category'],
        supplier=sample_row['supplier'],
        current_stock=int(sample_row['current_stock']),
        reorder_level=int(sample_row['reorder_level']),
        purchase_price=float(sample_row['purchase_price']),
        selling_price=float(sample_row['selling_price']),
        lead_time=int(sample_row['lead_time']),
        historical_sales=json.dumps(historical_sales)
    )
    
    return product

def test_forecasting():
    product = create_test_product()
    
    # Get 30-day forecast
    forecast_results = forecast_demand(product, 30)
    
    # Plot results
    days = list(range(1, 31))
    
    plt.figure(figsize=(12, 6))
    plt.plot(days, forecast_results['lstm'], label='LSTM Forecast')
    plt.plot(days, forecast_results['prophet'], label='Prophet Forecast')
    plt.plot(days, forecast_results['ensemble'], label='Ensemble Forecast', linewidth=2)
    
    plt.title(f'30-Day Demand Forecast for {product.name}')
    plt.xlabel('Days')
    plt.ylabel('Predicted Demand')
    plt.legend()
    plt.grid(True)
    plt.savefig('forecast_test.png')
    plt.close()
    
    print("Forecast results:")
    print(f"LSTM: {forecast_results['lstm'][:5]}...")
    print(f"Prophet: {forecast_results['prophet'][:5]}...")
    print(f"Ensemble: {forecast_results['ensemble'][:5]}...")
    
    return forecast_results

def test_restock_recommendation():
    product = create_test_product()
    
    # Get restock recommendations
    standard_recommendation = recommend_restock(product, False)
    trending_recommendation = recommend_restock(product, True)
    
    print("\nRestock Recommendations:")
    print("Standard Product:")
    print(f"Predicted Demand: {standard_recommendation['predicted_demand']}")
    print(f"Safety Stock: {standard_recommendation['safety_stock']}")
    print(f"Recommended Restock: {standard_recommendation['recommended_restock']}")
    
    print("\nTrending Product (with 30% buffer):")
    print(f"Predicted Demand: {trending_recommendation['predicted_demand']}")
    print(f"Safety Stock: {trending_recommendation['safety_stock']}")
    print(f"Recommended Restock: {trending_recommendation['recommended_restock']}")
    
    return standard_recommendation, trending_recommendation

if __name__ == "__main__":
    print("Testing ML models...")
    forecast_results = test_forecasting()
    standard_rec, trending_rec = test_restock_recommendation()
    print("\nTest completed. See forecast_test.png for visualization.") 