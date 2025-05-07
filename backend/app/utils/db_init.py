import pandas as pd
from app.models.inventory import Product
from app.extensions import db
from main import create_app, init_db
import json
import os
import ast

def init_inventory():
    app = create_app()
    with app.app_context():
        # Initialize database and create admin user
        init_db(app)
        
        # Get the path to the inventory data
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, '..', '..', 'data', 'inventory_data.csv')
        
        try:
            # Read the CSV file
            df = pd.read_csv(data_path)
            
            # Delete existing products
            Product.query.delete()
            db.session.commit()
            
            # Insert new data
            for _, row in df.iterrows():
                # Convert historical_sales string to proper JSON format
                historical_sales = ast.literal_eval(row['historical_sales'])
                historical_sales_json = json.dumps(historical_sales)
                
                product = Product(
                    id=row['product_id'],
                    name=row['name'],
                    category=row['category'],
                    supplier=row['supplier'],
                    current_stock=int(row['current_stock']),
                    reorder_level=int(row['reorder_level']),
                    purchase_price=float(row['purchase_price']),
                    selling_price=float(row['selling_price']),
                    lead_time=int(row['lead_time']),
                    historical_sales=historical_sales_json
                )
                db.session.add(product)
            
            # Commit all changes
            db.session.commit()
            print("Database initialized successfully with inventory data!")
            
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    init_inventory() 