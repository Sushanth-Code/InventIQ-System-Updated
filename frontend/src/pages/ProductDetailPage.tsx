import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService, predictionService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useVoice } from '../contexts/VoiceContext';

interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  current_stock: number;
  reorder_level: number;
  purchase_price: number;
  selling_price: number;
  lead_time: number;
  historical_sales: Record<string, number>;
}

interface ForecastData {
  lstm: number[];
  prophet: number[];
  ensemble: number[];
}

interface RestockRecommendation {
  predicted_demand: number;
  safety_stock: number;
  recommended_restock: number;
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [recommendation, setRecommendation] = useState<RestockRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [isTrending, setIsTrending] = useState(false);
  const { speak } = useVoice();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        // Fetch product details
        const productData = await inventoryService.getProduct(productId);
        setProduct(productData);
        
        // Fetch forecast
        const forecastData = await predictionService.getDemandForecast(productId, forecastDays);
        setForecast(forecastData.forecast);
        
        // Check if product is trending
        const historicalSales = Object.values(productData.historical_sales);
        const recentSales = historicalSales.slice(-7);
        const olderSales = historicalSales.slice(-14, -7);
        
        if (recentSales.length > 0 && olderSales.length > 0) {
          const recentAvg =
            (recentSales as number[]).reduce((sum, val) => sum + val, 0) / recentSales.length;
        
          const olderAvg =
            (olderSales as number[]).reduce((sum, val) => sum + val, 0) / olderSales.length;
        
          setIsTrending(recentAvg > olderAvg * 1.1); // 10% increase = trending
        }
        
        
        // Fetch restock recommendation
        const recommendationData = await predictionService.getRestockRecommendation(
          productId, 
          isTrending
        );
        setRecommendation(recommendationData.recommendation);
        
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, forecastDays, isTrending]);

  // Prepare chart data
const prepareChartData = (): { day: string; lstm: number; prophet: number; ensemble: number }[] => {
  if (!forecast) return [];

  const chartData: { day: string; lstm: number; prophet: number; ensemble: number }[] = [];

  for (let i = 0; i < forecast.ensemble.length; i++) {
    chartData.push({
      day: `Day ${i + 1}`,
      lstm: forecast.lstm[i],
      prophet: forecast.prophet[i],
      ensemble: forecast.ensemble[i]
    });
  }

  return chartData;
};


  // Prepare historical sales data
  const prepareHistoricalData = (): { day: string; sales: number }[] => {
      if (!product || !product.historical_sales) return [];

  // Convert object entries to an array of [day, quantity]
  const salesEntries = Object.entries(product.historical_sales);

  // Sort the entries by the numeric day value
  salesEntries.sort((a, b) => {
    const dayA = parseInt(a[0].split('-')[1]);
    const dayB = parseInt(b[0].split('-')[1]);
    return dayA - dayB;
  });

  // Take only the last 30 entries
  const recentEntries = salesEntries.slice(-30);

  // Format entries into the desired structure
  const historicalData: { day: string; sales: number }[] = recentEntries.map(
    ([day, quantity]) => ({
      day: day.replace('Day-', 'Day '),
      sales: quantity,
    })
  );

  return historicalData;
};

  // Handle sale
  const handleSale = async () => {
    if (!product) return;
    
    try {
      const response = await inventoryService.recordTransaction({
        product_id: product.id,
        transaction_type: 'sale',
        quantity: 1
      });
      
      setProduct(prev => {
        if (!prev) return null;
        return { ...prev, current_stock: prev.current_stock - 1 };
      });
      
      speak(`Sale recorded. Current stock: ${response.updated_stock}`);
    } catch (err: any) {
      alert('Error recording sale: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle restock
  const handleRestock = async () => {
    if (!product || !recommendation) return;
    
    try {
      const response = await inventoryService.recordTransaction({
        product_id: product.id,
        transaction_type: 'restock',
        quantity: recommendation.recommended_restock
      });
      
      setProduct(prev => {
        if (!prev) return null;
        return { ...prev, current_stock: response.updated_stock };
      });
      
      speak(`Restock complete. New stock level: ${response.updated_stock}`);
    } catch (err: any) {
      alert('Error restocking: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!product) return <div className="text-red-500">Product not found</div>;

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/inventory')}
        className="mb-4 flex items-center text-primary hover:underline"
      >
        <span className="material-icons mr-1">arrow_back</span> Back to Inventory
      </button>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-dark mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">ID: {product.id}</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSale}
              disabled={product.current_stock <= 0}
              className={`px-4 py-2 rounded ${
                product.current_stock <= 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Record Sale
            </button>
            
            {recommendation && recommendation.recommended_restock > 0 && (
              <button
                onClick={handleRestock}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
              >
                Restock ({recommendation.recommended_restock} units)
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Category</p>
            <p className="text-lg font-semibold">{product.category}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Supplier</p>
            <p className="text-lg font-semibold">{product.supplier}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Lead Time</p>
            <p className="text-lg font-semibold">{product.lead_time} days</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-lg font-semibold">${product.selling_price.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Stock Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`rounded-lg shadow p-6 ${
          product.current_stock === 0
            ? 'bg-red-50 border border-red-200'
            : product.current_stock <= product.reorder_level
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-green-50 border border-green-200'
        }`}>
          <h2 className="text-lg font-semibold mb-2">Current Stock</h2>
          <p className="text-3xl font-bold">
            {product.current_stock}
            <span className="text-sm font-normal ml-2">units</span>
          </p>
          
          <div className="mt-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.current_stock === 0
                ? 'bg-red-100 text-red-800'
                : product.current_stock <= product.reorder_level
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-green-100 text-green-800'
            }`}>
              {product.current_stock === 0
                ? 'Out of Stock'
                : product.current_stock <= product.reorder_level
                  ? 'Low Stock'
                  : 'In Stock'}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Reorder Level</h2>
          <p className="text-3xl font-bold">
            {product.reorder_level}
            <span className="text-sm font-normal ml-2">units</span>
          </p>
          
          <div className="mt-4 text-sm text-gray-600">
            Restock when inventory falls below this level
          </div>
        </div>
        
        {recommendation && (
          <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
            <h2 className="text-lg font-semibold mb-2">Restock Recommendation</h2>
            <p className="text-3xl font-bold">
              {recommendation.recommended_restock}
              <span className="text-sm font-normal ml-2">units</span>
            </p>
            
            <div className="mt-4 text-sm">
              <p><span className="font-medium">Predicted Demand:</span> {recommendation.predicted_demand} units</p>
              <p><span className="font-medium">Safety Stock:</span> {recommendation.safety_stock} units</p>
              <p className="mt-2 text-xs text-gray-600">
                {isTrending ? 'Includes 30% buffer for trending product' : 'Includes standard safety stock'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Demand Forecast */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Demand Forecast</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Forecast Days:</label>
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value))}
              className="p-1 border border-gray-300 rounded"
            >
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
        </div>
        
        {forecast && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lstm" stroke="#8884d8" name="LSTM Model" />
              <Line type="monotone" dataKey="prophet" stroke="#82ca9d" name="Prophet Model" />
              <Line type="monotone" dataKey="ensemble" stroke="#ff7300" name="Ensemble (Recommended)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Historical Sales */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Historical Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={prepareHistoricalData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#1E88E5" name="Units Sold" />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 flex items-center">
          <span className="text-sm mr-2">
            Product Status:
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isTrending ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isTrending ? 'Trending Up' : 'Stable'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;