from flask import Blueprint, request, jsonify
from app.models.inventory import Product, Transaction
from app.routes.auth import token_required
from main import db
import json
from datetime import datetime

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/', methods=['GET'])
@token_required
def get_all_products(current_user):
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200

@inventory_bp.route('/<product_id>', methods=['GET'])
@token_required
def get_product(current_user, product_id):
    product = Product.query.get_or_404(product_id)  
    return jsonify(product.to_dict()), 200

@inventory_bp.route('/', methods=['POST'])
@token_required
def add_product(current_user):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Permission denied!'}), 403
        
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['id', 'name', 'category', 'supplier', 'current_stock', 
                      'reorder_level', 'purchase_price', 'selling_price', 'lead_time']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Format historical sales as JSON string if provided
    if 'historical_sales' in data:
        historical_sales = json.dumps(data['historical_sales'])
    else:
        # Initialize with empty data for a new product
        historical_sales = json.dumps({})
    
    product = Product(
        id=data['id'],
        name=data['name'],
        category=data['category'],
        supplier=data['supplier'],
        current_stock=data['current_stock'],
        reorder_level=data['reorder_level'],
        purchase_price=data['purchase_price'],
        selling_price=data['selling_price'],
        lead_time=data['lead_time'],
        historical_sales=historical_sales
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({
        'message': 'Product added successfully!',
        'product': product.to_dict()
    }), 201

@inventory_bp.route('/<product_id>', methods=['PUT'])
@token_required
def update_product(current_user, product_id):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Permission denied!'}), 403
        
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    # Update fields
    for field in data:
        if field == 'historical_sales':
            setattr(product, field, json.dumps(data[field]))
        else:
            setattr(product, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Product updated successfully!',
        'product': product.to_dict()
    }), 200

@inventory_bp.route('/<product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Permission denied!'}), 403
    
    # Check if we should delete all products from the supplier
    delete_supplier = request.args.get('delete_supplier', 'false').lower() == 'true'
    
    product = Product.query.get_or_404(product_id)
    supplier_name = product.supplier
    
    if delete_supplier:
        # Delete all products from this supplier
        products_to_delete = Product.query.filter_by(supplier=supplier_name).all()
        for p in products_to_delete:
            db.session.delete(p)
        
        db.session.commit()
        return jsonify({'message': f'Supplier {supplier_name} and all associated products deleted successfully!'}), 200
    else:
        # Delete just this product
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully!'}), 200

@inventory_bp.route('/transaction', methods=['POST'])
@token_required
def record_transaction(current_user):
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['product_id', 'transaction_type', 'quantity']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    product = Product.query.get_or_404(data['product_id'])
    
    # Create transaction record
    transaction = Transaction(
        product_id=data['product_id'],
        transaction_type=data['transaction_type'],
        quantity=data['quantity']
    )
    
    # Update product stock based on transaction type
    if data['transaction_type'] == 'sale':
        if product.current_stock < data['quantity']:
            return jsonify({'message': 'Insufficient stock!'}), 400
        product.current_stock -= data['quantity']
        
        # Update historical sales
        historical_sales = json.loads(product.historical_sales)
        today = datetime.utcnow().strftime('Day-%j')  # Day of year
        
        if today in historical_sales:
            historical_sales[today] += data['quantity']
        else:
            historical_sales[today] = data['quantity']
            
        product.historical_sales = json.dumps(historical_sales)
        
    elif data['transaction_type'] == 'restock':
        product.current_stock += data['quantity']
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction recorded successfully!',
        'transaction': {
            'id': transaction.id,
            'product_id': transaction.product_id,
            'transaction_type': transaction.transaction_type,
            'quantity': transaction.quantity,
            'transaction_date': transaction.transaction_date.isoformat()
        },
        'updated_stock': product.current_stock
    }), 201