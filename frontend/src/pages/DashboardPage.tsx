import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useVoice } from '../contexts/VoiceContext';

interface Product {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  reorder_level: number;
  purchase_price: number;
  selling_price: number;
  lead_time: number;
  historical_sales: Record<string, number>;
}

const COLORS = ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#5E35B1', '#00ACC1'];

const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { startListening, stopListening, isListening, transcript, response } = useVoice();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await inventoryService.getAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate key metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.current_stock <= p.reorder_level);
  const outOfStockProducts = products.filter(p => p.current_stock === 0);
  
  // Prepare data for category distribution chart
  const categoryData = Object.entries(
    products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Prepare data for stock level overview
  const stockLevelData = [
    {
      name: 'Stock Levels',
      healthy: products.filter(p => p.current_stock > p.reorder_level).length,
      low: lowStockProducts.length,
      out: outOfStockProducts.length,
    }
  ];

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        
        {/* Voice Assistant Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center px-4 py-2 rounded-full ${
            isListening ? 'bg-red-500 text-white' : 'bg-primary text-white'
          }`}
        >
          <span className="material-icons mr-2">
            {isListening ? 'mic' : 'Ask'}
          </span>
          {isListening ? 'Stop Listening' : 'Assistant'}
        </button>
      </div>
      
      {/* Voice Assistant Transcript */}
      {(transcript || response) && (
        <div className="bg-light p-4 rounded-lg mb-6">
          {transcript && (
            <div className="mb-2">
              <span className="font-bold">You said:</span> {transcript}
            </div>
          )}
          {response && (
            <div>
              <span className="font-bold">Assistant:</span> {response}
            </div>
          )}
        </div>
      )}
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Products</h2>
          <p className="text-3xl font-bold text-primary">{totalProducts}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Low Stock Items</h2>
          <p className="text-3xl font-bold text-warning">{lowStockProducts.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Out of Stock</h2>
          <p className="text-3xl font-bold text-danger">{outOfStockProducts.length}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Stock Level Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockLevelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="healthy" stroke="#43A047" name="Healthy Stock" />
              <Line type="monotone" dataKey="low" stroke="#FB8C00" name="Low Stock" />
              <Line type="monotone" dataKey="out" stroke="#E53935" name="Out of Stock" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Low Stock Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
        {lowStockProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Product ID</th>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Category</th>
                  <th className="py-2 px-4 border-b text-left">Current Stock</th>
                  <th className="py-2 px-4 border-b text-left">Reorder Level</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-2 px-4 border-b">{product.id}</td>
                    <td className="py-2 px-4 border-b">{product.name}</td>
                    <td className="py-2 px-4 border-b">{product.category}</td>
                    <td className="py-2 px-4 border-b">{product.current_stock}</td>
                    <td className="py-2 px-4 border-b">{product.reorder_level}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.current_stock === 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {product.current_stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No low stock items to display.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;