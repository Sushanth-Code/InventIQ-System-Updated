import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../services/api';

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

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    supplier: '',
    current_stock: 0,
    reorder_level: 0,
    purchase_price: 0,
    selling_price: 0,
    lead_time: 0,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setError(null);
        const data = await inventoryService.getProduct(productId);
        setFormData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'category' || name === 'supplier' 
        ? value 
        : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || saving) return;

    try {
      setSaving(true);
      setError(null);

      // Prepare the data to send
      const updateData = {
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier,
        current_stock: formData.current_stock,
        reorder_level: formData.reorder_level,
        purchase_price: formData.purchase_price,
        selling_price: formData.selling_price,
        lead_time: formData.lead_time,
      };

      // Log the request data for debugging
      console.log('Sending update request:', {
        productId,
        updateData,
        token: localStorage.getItem('token')
      });

      // Make the API call
      const response = await inventoryService.updateProduct(productId, updateData);
      console.log('Update response:', response);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
      successMessage.textContent = 'Product updated successfully!';
      document.body.appendChild(successMessage);

      // Navigate back to inventory page after a short delay
      setTimeout(() => {
        document.body.removeChild(successMessage);
        navigate('/inventory');
      }, 1500);

    } catch (err: any) {
      console.error('Update error:', err);
      console.error('Error response:', err.response);
      
      // More detailed error message
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to update product. Please check your connection and try again.';
      setError(errorMessage);
      
      // Scroll to error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/inventory')}
        className="mb-4 flex items-center text-primary hover:underline"
      >
        <span className="material-icons mr-1">arrow_back</span> Back to Inventory
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-dark mb-6">Edit Product</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price ($)
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price ($)
              </label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Time (days)
              </label>
              <input
                type="number"
                name="lead_time"
                value={formData.lead_time}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${
                saving 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-blue-600'
              }`}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage; 