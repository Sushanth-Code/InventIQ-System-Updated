import os
import json
import csv
from flask import Blueprint, request, jsonify

csv_handler = Blueprint('csv_handler', __name__)

# Path to the CSV file
CSV_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'inventory_data.csv')

@csv_handler.route('/update_csv', methods=['POST'])
def update_csv():
    """
    Update the CSV file with new product data
    """
    try:
        # Get product data from request
        product_data = request.json
        
        if not product_data:
            return jsonify({'success': False, 'message': 'No product data provided'}), 400
        
        # Read existing data from CSV
        existing_products = []
        with open(CSV_FILE_PATH, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            existing_products = list(reader)
        
        # Check if product already exists
        product_exists = False
        for i, product in enumerate(existing_products):
            if product['product_id'] == product_data.get('id') or product['product_id'] == product_data.get('product_id'):
                # Update existing product
                existing_products[i] = {
                    'product_id': product_data.get('id') or product_data.get('product_id'),
                    'name': product_data.get('name', ''),
                    'category': product_data.get('category', ''),
                    'supplier': product_data.get('supplier', ''),
                    'current_stock': str(product_data.get('current_stock', 0)),
                    'reorder_level': str(product_data.get('reorder_level', 0)),
                    'purchase_price': str(product_data.get('purchase_price', 0)),
                    'selling_price': str(product_data.get('selling_price', 0)),
                    'lead_time': str(product_data.get('lead_time', 0)),
                    'historical_sales': json.dumps(product_data.get('historical_sales', {}))
                }
                product_exists = True
                break
        
        # Add new product if it doesn't exist
        if not product_exists:
            new_product = {
                'product_id': product_data.get('id') or product_data.get('product_id'),
                'name': product_data.get('name', ''),
                'category': product_data.get('category', ''),
                'supplier': product_data.get('supplier', ''),
                'current_stock': str(product_data.get('current_stock', 0)),
                'reorder_level': str(product_data.get('reorder_level', 0)),
                'purchase_price': str(product_data.get('purchase_price', 0)),
                'selling_price': str(product_data.get('selling_price', 0)),
                'lead_time': str(product_data.get('lead_time', 0)),
                'historical_sales': json.dumps(product_data.get('historical_sales', {}))
            }
            existing_products.append(new_product)
        
        # Write updated data back to CSV
        with open(CSV_FILE_PATH, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['product_id', 'name', 'category', 'supplier', 'current_stock', 
                          'reorder_level', 'purchase_price', 'selling_price', 'lead_time', 'historical_sales']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(existing_products)
        
        return jsonify({
            'success': True, 
            'message': 'CSV file updated successfully',
            'product_action': 'updated' if product_exists else 'added'
        })
    
    except Exception as e:
        print(f"Error updating CSV: {str(e)}")
        return jsonify({'success': False, 'message': f'Error updating CSV: {str(e)}'}), 500

@csv_handler.route('/get_csv_data', methods=['GET'])
def get_csv_data():
    """
    Get all data from the CSV file
    """
    try:
        # Read data from CSV
        products = []
        with open(CSV_FILE_PATH, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Convert historical_sales from string to object
                try:
                    row['historical_sales'] = json.loads(row['historical_sales'])
                except:
                    row['historical_sales'] = {}
                products.append(row)
        
        return jsonify({
            'success': True,
            'products': products
        })
    
    except Exception as e:
        print(f"Error reading CSV: {str(e)}")
        return jsonify({'success': False, 'message': f'Error reading CSV: {str(e)}'}), 500
