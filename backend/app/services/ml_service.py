import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def prepare_time_series(product):
    """Convert historical sales to time series data."""
    historical_sales = json.loads(product.historical_sales)
    
    # Convert to dataframe
    sales_data = []
    for day, quantity in historical_sales.items():
        sales_data.append({'day': day, 'quantity': quantity})
        
    df = pd.DataFrame(sales_data)
    
    # Sort by day
    df['day_num'] = df['day'].str.extract(r'Day-(\d+)').astype(int)
    df = df.sort_values('day_num')
    
    return df

def simple_forecast(product, days=30):
    """Use simple moving average to forecast demand."""
    df = prepare_time_series(product)
    
    # If insufficient data, return simple average
    if len(df) < 5:
        avg_sales = df['quantity'].mean()
        return [round(avg_sales) for _ in range(days)]
    
    # Calculate moving average
    window_size = min(5, len(df))
    df['ma'] = df['quantity'].rolling(window=window_size).mean()
    
    # Get the last moving average value
    last_ma = df['ma'].iloc[-1]
    
    # Generate forecast
    forecast = []
    for i in range(days):
        # Add some random variation to make it more realistic
        variation = np.random.normal(0, last_ma * 0.1)  # 10% standard deviation
        forecast.append(max(0, round(last_ma + variation)))
    
    return forecast

def forecast_demand(product, days=30):
    """Forecast demand using simple moving average."""
    return simple_forecast(product, days)

def recommend_restock(product, is_trending=False):
    """Recommend restock quantity based on forecast and current stock."""
    forecast = forecast_demand(product, days=7)  # Forecast next 7 days
    avg_daily_demand = sum(forecast) / len(forecast)
    
    # Calculate safety stock (2 weeks worth)
    safety_stock = avg_daily_demand * 14
    
    # Calculate reorder point
    reorder_point = avg_daily_demand * 7 + safety_stock
    
    # Calculate order quantity
    current_stock = product.current_stock
    order_quantity = max(0, round(reorder_point - current_stock))
    
    # If trending, increase order by 20%
    if is_trending:
        order_quantity = round(order_quantity * 1.2)
    
    return order_quantity