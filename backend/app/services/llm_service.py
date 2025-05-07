import json
import openai
from flask import current_app
from app.models.inventory import Product, Transaction
import pandas as pd

def prepare_inventory_summary():
    """Prepare a summary of inventory data for the LLM context."""
    products = Product.query.all()
    
    # Convert to dataframe for easier analysis
    products_data = []
    for p in products:
        products_data.append({
            'id': p.id,
            'name': p.name,
            'category': p.category,
            'supplier': p.supplier,
            'current_stock': p.current_stock,
            'reorder_level': p.reorder_level
        })
        
    df = pd.DataFrame(products_data)
    
    # Create summary stats
    category_counts = df['category'].value_counts().to_dict()
    low_stock_items = df[df['current_stock'] <= df['reorder_level']].shape[0]
    out_of_stock_items = df[df['current_stock'] == 0].shape[0]
    
    summary = {
        'total_products': len(products),
        'categories': category_counts,
        'low_stock_count': low_stock_items,
        'out_of_stock_count': out_of_stock_items
    }
    
    return summary

def get_product_details(product_id):
    """Get detailed information about a specific product."""
    product = Product.query.get(product_id)
    if not product:
        return None
        
    return product.to_dict()

def get_llm_insights(query, product_id=None):
    """Generate insights using LLM based on user query."""
    openai.api_key = current_app.config['OPENAI_API_KEY']
    
    # Prepare context for the LLM
    inventory_summary = prepare_inventory_summary()
    
    # Add specific product details if provided
    product_details = None
    if product_id:
        product_details = get_product_details(product_id)
    
    # Create the prompt
    prompt = f"""
    You are an intelligent inventory management assistant.
    
    Inventory Summary:
    {json.dumps(inventory_summary, indent=2)}
    
    {"Product Details:" + json.dumps(product_details, indent=2) if product_details else ""}
    
    User Query: {query}
    
    Provide a helpful, concise response addressing the user's query based on the inventory data provided above.
    For restock recommendations, include a 30% buffer for trending or fast-moving products.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI inventory management assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        insight = response.choices[0].message['content'].strip()
        return insight
        
    except Exception as e:
        return f"Error generating insights: {str(e)}"