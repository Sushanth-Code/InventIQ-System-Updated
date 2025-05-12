// Mock data service for InventIQ application

// Mock data for the application
export interface Product {
  id: string; // Changed from product_id to id to match frontend expectations
  product_id?: string; // Keep this for backward compatibility
  name: string;
  category: string;
  supplier: string;
  current_stock: number;
  reorder_level: number;
  purchase_price: number;
  selling_price: number;
  lead_time: number;
  historical_sales?: Record<string, number>;
}

// Sample inventory data
const sampleInventoryData: Product[] = [
  {
    id: 'P0001',
    product_id: 'P0001',
    name: 'Product 1',
    category: 'Toys',
    supplier: 'Supplier A',
    current_stock: 304,
    reorder_level: 22,
    purchase_price: 178.75,
    selling_price: 256.88,
    lead_time: 5,
    historical_sales: {'Day-1': 15, 'Day-2': 41, 'Day-3': 20, 'Day-4': 14, 'Day-5': 25, 'Day-6': 9, 'Day-7': 45, 'Day-8': 3, 'Day-9': 7, 'Day-10': 41}
  },
  {
    id: 'P0002',
    product_id: 'P0002',
    name: 'Product 2',
    category: 'Toys',
    supplier: 'Supplier C',
    current_stock: 251,
    reorder_level: 58,
    purchase_price: 174.02,
    selling_price: 219.46,
    lead_time: 2,
    historical_sales: {'Day-1': 17, 'Day-2': 2, 'Day-3': 24, 'Day-4': 30, 'Day-5': 43, 'Day-6': 2, 'Day-7': 33, 'Day-8': 39, 'Day-9': 11, 'Day-10': 46}
  },
  {
    id: 'P0003',
    product_id: 'P0003',
    name: 'Product 3',
    category: 'Home & Kitchen',
    supplier: 'Supplier A',
    current_stock: 126,
    reorder_level: 90,
    purchase_price: 155.84,
    selling_price: 220.6,
    lead_time: 5,
    historical_sales: {'Day-1': 12, 'Day-2': 43, 'Day-3': 30, 'Day-4': 36, 'Day-5': 4, 'Day-6': 35, 'Day-7': 41, 'Day-8': 24, 'Day-9': 37, 'Day-10': 30}
  },
  {
    id: 'P0004',
    product_id: 'P0004',
    name: 'Product 4',
    category: 'Clothing',
    supplier: 'Supplier B',
    current_stock: 493,
    reorder_level: 69,
    purchase_price: 152.4,
    selling_price: 168.42,
    lead_time: 10,
    historical_sales: {'Day-1': 45, 'Day-2': 30, 'Day-3': 49, 'Day-4': 10, 'Day-5': 18, 'Day-6': 26, 'Day-7': 42, 'Day-8': 26, 'Day-9': 30, 'Day-10': 8}
  },
  {
    id: 'P0005',
    product_id: 'P0005',
    name: 'Product 5',
    category: 'Books',
    supplier: 'Supplier A',
    current_stock: 246,
    reorder_level: 31,
    purchase_price: 400.81,
    selling_price: 510.68,
    lead_time: 5,
    historical_sales: {'Day-1': 41, 'Day-2': 22, 'Day-3': 2, 'Day-4': 4, 'Day-5': 39, 'Day-6': 7, 'Day-7': 16, 'Day-8': 24, 'Day-9': 8, 'Day-10': 36}
  }
];

// Mock dashboard data
export const mockDashboardData = {
  totalProducts: 200, // Updated to match the actual product count in the CSV
  lowStockProducts: 25,
  outOfStockProducts: 8,
  totalCategories: 6,
  totalSuppliers: 4,
  recentTransactions: [
    { id: 'T001', product: 'Product 1', type: 'Sale', quantity: 10, date: new Date().toISOString() },
    { id: 'T002', product: 'Product 3', type: 'Restock', quantity: 50, date: new Date().toISOString() },
    { id: 'T003', product: 'Product 2', type: 'Sale', quantity: 5, date: new Date().toISOString() },
    { id: 'T004', product: 'Product 5', type: 'Sale', quantity: 8, date: new Date().toISOString() },
    { id: 'T005', product: 'Product 4', type: 'Restock', quantity: 30, date: new Date().toISOString() }
  ],
  salesByCategory: [
    { category: 'Electronics', value: 35 },
    { category: 'Clothing', value: 25 },
    { category: 'Home & Kitchen', value: 20 },
    { category: 'Toys', value: 15 },
    { category: 'Books', value: 10 },
    { category: 'Groceries', value: 5 }
  ],
  stockDistribution: [
    { name: 'In Stock', value: 152 },
    { name: 'Low Stock', value: 23 },
    { name: 'Out of Stock', value: 5 }
  ]
};

// Mock trend data
export const mockTrendData = {
  salesTrend: [
    { date: '2025-04-01', sales: 120 },
    { date: '2025-04-02', sales: 140 },
    { date: '2025-04-03', sales: 130 },
    { date: '2025-04-04', sales: 170 },
    { date: '2025-04-05', sales: 160 },
    { date: '2025-04-06', sales: 190 },
    { date: '2025-04-07', sales: 210 }
  ],
  topSellingProducts: [
    { product: 'Product 3', sales: 210 },
    { product: 'Product 1', sales: 180 },
    { product: 'Product 5', sales: 150 },
    { product: 'Product 2', sales: 120 },
    { product: 'Product 4', sales: 90 }
  ],
  categoryTrends: [
    { category: 'Electronics', trend: 15 },
    { category: 'Clothing', trend: 8 },
    { category: 'Home & Kitchen', trend: 12 },
    { category: 'Toys', trend: -5 },
    { category: 'Books', trend: 3 },
    { category: 'Groceries', trend: -2 }
  ]
};

// Function to load inventory data directly from the CSV file
export const loadInventoryData = async (): Promise<Product[]> => {
  try {
    // Fetch the CSV file from the public folder
    const response = await fetch('/data/inventory_data.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch inventory data');
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    // Parse the CSV data into an array of products
    const products: Product[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',');
      if (values.length < 9) continue; // Skip malformed lines
      
      const product: any = {};
      
      // Map CSV columns to product properties
      product.id = values[0]; // Use product_id as id
      product.product_id = values[0];
      product.name = values[1];
      product.category = values[2];
      product.supplier = values[3];
      product.current_stock = parseInt(values[4]);
      product.reorder_level = parseInt(values[5]);
      product.purchase_price = parseFloat(values[6]);
      product.selling_price = parseFloat(values[7]);
      product.lead_time = parseInt(values[8]);
      
      // Parse historical sales if available
      if (values[9]) {
        try {
          // Clean up the historical sales string and parse it
          const salesStr = values[9].replace(/'/g, '"');
          product.historical_sales = JSON.parse(salesStr);
        } catch (e) {
          console.error('Error parsing historical sales for product', product.id, e);
          product.historical_sales = {};
        }
      }
      
      products.push(product as Product);
    }
    
    console.log(`Loaded ${products.length} products from CSV file`);
    
    // If we successfully loaded products, return them
    if (products.length > 0) {
      return products;
    } else {
      // If no products were loaded, throw an error to trigger the fallback
      throw new Error('No products loaded from CSV');
    }
  } catch (error) {
    console.error('Error loading CSV data:', error);
    // Try to load from the data folder directly if public folder fails
    try {
      const response = await fetch('/data/inventory_data.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data from alternate location');
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      // Parse the CSV data into an array of products
      const products: Product[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',');
        if (values.length < 9) continue; // Skip malformed lines
        
        const product: any = {};
        
        // Map CSV columns to product properties
        product.id = values[0];
        product.product_id = values[0];
        product.name = values[1];
        product.category = values[2];
        product.supplier = values[3];
        product.current_stock = parseInt(values[4]);
        product.reorder_level = parseInt(values[5]);
        product.purchase_price = parseFloat(values[6]);
        product.selling_price = parseFloat(values[7]);
        product.lead_time = parseInt(values[8]);
        
        // Parse historical sales if available
        if (values[9]) {
          try {
            const salesStr = values[9].replace(/'/g, '"');
            product.historical_sales = JSON.parse(salesStr);
          } catch (e) {
            console.error('Error parsing historical sales for product', product.id, e);
            product.historical_sales = {};
          }
        }
        
        products.push(product as Product);
      }
      
      console.log(`Loaded ${products.length} products from alternate CSV location`);
      if (products.length > 0) {
        return products;
      }
    } catch (altError) {
      console.error('Error loading from alternate location:', altError);
    }
    
    // Only use the first 5 products from sample data as requested
    console.log('Using only the first 5 products from sample data');
    return sampleInventoryData.slice(0, 5);
  }
};

// Function to save inventory data to localStorage and CSV file
const saveInventoryData = async (products: Product[]): Promise<boolean> => {
  try {
    // Sort products by ID to maintain consistent order
    const sortedProducts = [...products].sort((a, b) => a.id.localeCompare(b.id));
    
    // Save to localStorage
    localStorage.setItem('inventoryData', JSON.stringify(sortedProducts));
    
    console.log(`Saved ${products.length} products to localStorage`);
    
    // Also update the CSV file via our backend API
    try {
      // We'll update the CSV file one product at a time to ensure consistency
      for (const product of sortedProducts) {
        await fetch('http://localhost:5000/api/csv/update_csv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });
      }
      console.log('CSV file updated successfully');
    } catch (csvError) {
      console.error('Failed to update CSV file:', csvError);
      // Continue even if CSV update fails - at least localStorage will be updated
    }
    
    return true;
  } catch (error) {
    console.error('Error saving inventory data:', error);
    return false;
  }
};

// Mock API service
export const mockApiService = {
  // Inventory methods
  getAllProducts: async () => {
    // Check if we have data in localStorage first
    const cachedData = localStorage.getItem('inventoryData');
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as Product[];
      } catch (e) {
        console.error('Error parsing cached data, loading from CSV instead');
      }
    }
    
    // If no cached data or error parsing, load from CSV
    const products = await loadInventoryData();
    
    // Cache the data for future use
    saveInventoryData(products);
    
    return products;
  },

  getProduct: async (productId: string) => {
    const products = await mockApiService.getAllProducts();
    const product = products.find((p: Product) => p.id === productId || p.product_id === productId);
    if (!product) throw new Error('Product not found');
    return product;
  },
  
  addProduct: async (productData: any) => {
    try {
      // Get current products
      const products = await loadInventoryData(); // Load directly from CSV to ensure fresh data
      
      // Ensure product has an ID
      if (!productData.id) {
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 1000);
        productData.id = `P${timestamp}${randomNum}`;
      }
      
      // Add product_id for backward compatibility
      productData.product_id = productData.id;
      
      // Add historical_sales placeholder
      if (!productData.historical_sales) {
        productData.historical_sales = {};
        for (let i = 1; i <= 10; i++) {
          productData.historical_sales[`Day-${i}`] = Math.floor(Math.random() * 50);
        }
      }
      
      // Check if product already exists (by ID)
      const existingIndex = products.findIndex((p: Product) => p.id === productData.id || p.product_id === productData.id);
      
      if (existingIndex >= 0) {
        // Throw error for duplicate product ID
        throw new Error(`Product ID '${productData.id}' already exists. Product IDs must be unique.`);
      } else {
        // Add the new product
        products.push(productData);
        console.log('Added new product:', productData.id);
      }
      
      // Clear any cached data
      localStorage.removeItem('inventoryData');
      
      // Save updated products to localStorage with fresh data
      localStorage.setItem('inventoryData', JSON.stringify(products));
      
      console.log('Product added successfully. Refresh the page to see the new product.');
      
      return { success: true, message: 'Product added successfully. Please refresh the page to see the new product.', product: productData };
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
    }
  },
  
  updateProduct: async (productId: string, productData: any) => {
    try {
      // Get current products
      const products = await mockApiService.getAllProducts();
      
      // Find product index
      const index = products.findIndex((p: Product) => p.id === productId || p.product_id === productId);
      if (index === -1) throw new Error('Product not found');
      
      // Update product
      products[index] = { ...products[index], ...productData };
      
      // Ensure ID consistency
      products[index].id = productId;
      products[index].product_id = productId;
      
      // Save updated products
      await saveInventoryData(products);
      
      return { success: true, message: 'Product updated successfully', product: products[index] };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  },
  
  deleteProduct: async (productId: string, deleteSupplier: boolean = false) => {
    try {
      // Get current products
      const products = await mockApiService.getAllProducts();
      
      // Find the product to delete first
      const productToDelete = products.find((p: Product) => p.id === productId || p.product_id === productId);
      
      if (!productToDelete) {
        throw new Error('Product not found');
      }
      
      let updatedProducts;
      
      if (deleteSupplier) {
        // Delete all products from this supplier
        const supplierName = productToDelete.supplier;
        updatedProducts = products.filter((p: Product) => p.supplier !== supplierName);
        
        // Check if any products were removed
        if (updatedProducts.length === products.length) {
          throw new Error('No products found for this supplier');
        }
      } else {
        // Delete only the specific product
        updatedProducts = products.filter((p: Product) => p.id !== productId && p.product_id !== productId);
      }
      
      // Save updated products
      await saveInventoryData(updatedProducts);
      
      return { 
        success: true, 
        message: deleteSupplier 
          ? `Supplier ${productToDelete.supplier} and all associated products deleted successfully` 
          : 'Product deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  },

  // Dashboard methods
  getDashboardData: async () => {
    const products = await mockApiService.getAllProducts();
    
    // Calculate real metrics
    const lowStockItems = products.filter((p: Product) => p.current_stock <= p.reorder_level && p.current_stock > 0).length;
    const outOfStockItems = products.filter((p: Product) => p.current_stock === 0).length;
    const totalProducts = products.length;
    const uniqueCategories = new Set(products.map((p: Product) => p.category));
    
    return { 
      lowStockItems, 
      outOfStockItems, 
      totalProducts, 
      totalCategories: uniqueCategories.size 
    };
  },

  // Trend methods
  getTrendData: async () => {
    const products = await mockApiService.getAllProducts();
    
    // Calculate trend metrics based on historical sales
    let trendingUp = 0;
    let trendingDown = 0;
    
    // Process products to calculate trending products
    const topSellingProducts = products.map(product => {
      if (product.historical_sales) {
        const salesData = Object.values(product.historical_sales) as number[];
        if (salesData.length >= 6) {
          const firstHalf = salesData.slice(0, Math.floor(salesData.length / 2));
          const secondHalf = salesData.slice(Math.floor(salesData.length / 2));
          
          const firstHalfAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length;
          const secondHalfAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length;
          
          const avgSales = salesData.reduce((sum, val) => sum + val, 0) / salesData.length;
          const trend = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
          const trendPercentage = Math.abs(Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100));
          
          if (secondHalfAvg > firstHalfAvg * 1.1) trendingUp++;
          else if (secondHalfAvg < firstHalfAvg * 0.9) trendingDown++;
          
          return {
            id: product.id,
            name: product.name,
            category: product.category,
            avgSales,
            trend,
            trendPercentage
          };
        }
      }
      
      // Default values if no historical sales data
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        avgSales: 0,
        trend: 'stable',
        trendPercentage: 0
      };
    }).sort((a, b) => b.avgSales - a.avgSales).slice(0, 5); // Top 5 selling products
    
    // Generate sales trend data for the last 7 days
    const salesTrend = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      salesTrend.push({
        date: formattedDate,
        sales: Math.floor(Math.random() * 100) + 50 // Random sales between 50-150
      });
    }
    
    // Generate category trends
    const categories = [...new Set(products.map(p => p.category))];
    const categoryTrends = categories.map(category => {
      return {
        category,
        trend: Math.floor(Math.random() * 30) - 10 // Random trend between -10 and +20
      };
    });
    
    return { 
      topSellingProducts,
      salesTrend,
      categoryTrends,
      trendingUp, 
      trendingDown, 
      stableProducts: products.length - trendingUp - trendingDown 
    };
  }
};
