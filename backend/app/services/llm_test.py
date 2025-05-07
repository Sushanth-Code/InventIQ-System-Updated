import os
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.environ.get('OPENAI_API_KEY')

def test_llm_insights():
    # Sample inventory data
    inventory_summary = {
        "total_products": 200,
        "categories": {
            "Toys": 42,
            "Electronics": 35,
            "Home & Kitchen": 53,
            "Clothing": 45,
            "Books": 15,
            "Groceries": 10
        },
        "low_stock_count": 28,
        "out_of_stock_count": 5
    }
    
    # Sample product details
    product_details = {
        "id": "P0001",
        "name": "Product 1",
        "category": "Toys",
        "supplier": "Supplier A",
        "current_stock": 304,
        "reorder_level": 22,
        "purchase_price": 178.75,
        "selling_price": 256.88,
        "lead_time": 5
    }
    
    # Sample user queries
    queries = [
        "What products are low in stock?",
        "Should I restock Product 1?",
        "What's my best-selling category?"
    ]
    
    results = []
    
    for query in queries:
        # Create the prompt
        prompt = f"""
        You are an intelligent inventory management assistant.
        
        Inventory Summary:
        {inventory_summary}
        
        Product Details: {product_details}
        
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
            results.append({
                "query": query,
                "response": insight
            })
            
        except Exception as e:
            results.append({
                "query": query,
                "error": str(e)
            })
    
    # Print results
    print("\nLLM Test Results:")
    print("================\n")
    
    for result in results:
        print(f"Query: {result['query']}")
        if 'response' in result:
            print(f"Response: {result['response']}")
        else:
            print(f"Error: {result['error']}")
        print("\n---\n")
    
    return results

if __name__ == "__main__":
    print("Testing LLM integration...")
    test_llm_insights()
    print("\nTest completed.") 