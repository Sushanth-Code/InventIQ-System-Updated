from flask import Blueprint, request, jsonify
from app.models.inventory import Product
from app.routes.auth import token_required
from app.services.ml_service import forecast_demand, recommend_restock
from app.services.llm_service import get_llm_insights

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('/forecast/<product_id>', methods=['GET'])
@token_required
def get_demand_forecast(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    
    # Get forecast days from query params or default to 30
    days = request.args.get('days', default=30, type=int)
    
    forecast = forecast_demand(product, days)
    
    return jsonify({
        'product_id': product_id,
        'forecast_days': days,
        'forecast': forecast
    }), 200

@predictions_bp.route('/restock/<product_id>', methods=['GET'])
@token_required
def get_restock_recommendation(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    
    # Check if product is trending for buffer calculation
    is_trending = request.args.get('trending', default=False, type=bool)
    
    recommendation = recommend_restock(product, is_trending)
    
    return jsonify({
        'product_id': product_id,
        'current_stock': product.current_stock,
        'reorder_level': product.reorder_level,
        'lead_time': product.lead_time,
        'recommendation': recommendation
    }), 200

@predictions_bp.route('/insights', methods=['POST'])
@token_required
def get_insights(current_user):
    data = request.get_json()
    
    if 'query' not in data:
        return jsonify({'message': 'Missing query parameter!'}), 400
        
    query = data['query']
    product_id = data.get('product_id', None)
    
    insights = get_llm_insights(query, product_id)
    
    return jsonify({
        'query': query,
        'insights': insights
    }), 200