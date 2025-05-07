import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
}

const InventoryPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

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

  // Get unique categories for the filter
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Handle sale transaction
  const handleSale = async (productId: string) => {
    try {
      await inventoryService.recordTransaction({
        product_id: productId,
        transaction_type: 'sale',
        quantity: 1
      });
      
      // Update the product in state
      setProducts(prevProducts => prevProducts.map(product => {
        if (product.id === productId) {
          return { ...product, current_stock: product.current_stock - 1 };
        }
        return product;
      }));
    } catch (err: any) {
      alert('Error recording sale: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    const matchesStock = stockFilter === 'low' 
      ? product.current_stock <= product.reorder_level
      : stockFilter === 'out' 
        ? product.current_stock === 0
        : stockFilter === 'healthy'
          ? product.current_stock > product.reorder_level
          : true;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Inventory Management</h1>
        <Link 
          to="/inventory/add" 
          className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Product
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All</option>
              <option value="healthy">Healthy</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStockFilter('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 text-left">ID</th>
                <th className="py-3 px-4 bg-gray-100 text-left">Product Name</th>
                <th className="py-3 px-4 bg-gray-100 text-left">Category</th>
                <th className="py-3 px-4 bg-gray-100 text-left">Supplier</th>
                <th className="py-3 px-4 bg-gray-100 text-left">Stock</th>
                <th className="py-3 px-4 bg-gray-100 text-left">Status</th>
                <th className="py-3 px-4 bg-gray-100 text-left">Price</th>
                <th className="py-3 px-4 bg-gray-100 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{product.id}</td>
                  <td className="py-3 px-4">
                    <Link to={`/inventory/${product.id}`} className="text-primary hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">{product.supplier}</td>
                  <td className="py-3 px-4">{product.current_stock}</td>
                  <td className="py-3 px-4">
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
                  </td>
                  <td className="py-3 px-4">${product.selling_price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSale(product.id)}
                        disabled={product.current_stock <= 0}
                        className={`px-2 py-1 text-xs rounded ${
                          product.current_stock <= 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        Sell
                      </button>
                      {hasPermission('edit_product') && (
                        <Link
                          to={`/inventory/edit/${product.id}`}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-4">
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;