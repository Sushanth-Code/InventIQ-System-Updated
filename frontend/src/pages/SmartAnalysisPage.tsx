import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Divider, 
  Chip, 
  CircularProgress,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CameraAlt,
  FileUpload,
  Refresh,
  InsertChart,
  Psychology,
  Lightbulb,
  BarChart,
  ShowChart,
  Timeline,
  Category
} from '@mui/icons-material';
import { inventoryService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SmartAssistant from '../components/SmartAssistant/SmartAssistant';

// Type definitions
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
  historical_sales?: Record<string, number>;
}

interface ProductRecommendation {
  id: string;
  name: string;
  reason: string;
  action: string;
  impact: string;
  confidence: number;
  category: string;
}

interface CategoryInsight {
  category: string;
  growth: number;
  stockHealth: number;
  profitMargin: number;
  turnoverRate: number;
  recommendation: string;
}

// Smart Analysis Page
const SmartAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [imageRecognitionActive, setImageRecognitionActive] = useState(false);
  const [recognizedProduct, setRecognizedProduct] = useState<Product | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch inventory data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getAllProducts();
        setProducts(data);
        generateRecommendations(data);
        generateCategoryInsights(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate AI-powered recommendations based on inventory data
  const generateRecommendations = (data: Product[]) => {
    // This would normally be done by a real AI model
    // Here we're creating mock recommendations based on the data
    
    const mockRecommendations: ProductRecommendation[] = [];
    
    // Find low stock items
    const lowStockItems = data.filter(p => p.current_stock <= p.reorder_level && p.current_stock > 0);
    lowStockItems.slice(0, 3).forEach(product => {
      mockRecommendations.push({
        id: product.id,
        name: product.name,
        reason: `Current stock (${product.current_stock}) is below reorder level (${product.reorder_level})`,
        action: 'Restock immediately',
        impact: 'Prevent stockouts and maintain customer satisfaction',
        confidence: 95,
        category: product.category
      });
    });
    
    // Find items with high stock levels
    const highStockItems = data.filter(p => p.current_stock > p.reorder_level * 3);
    highStockItems.slice(0, 2).forEach(product => {
      mockRecommendations.push({
        id: product.id,
        name: product.name,
        reason: `Current stock (${product.current_stock}) is significantly above reorder level (${product.reorder_level})`,
        action: 'Consider running a promotion',
        impact: 'Reduce carrying costs and free up warehouse space',
        confidence: 85,
        category: product.category
      });
    });
    
    // Find items with high profit margin
    const profitableItems = data
      .filter(p => (p.selling_price - p.purchase_price) / p.purchase_price > 0.4)
      .sort((a, b) => 
        ((b.selling_price - b.purchase_price) / b.purchase_price) - 
        ((a.selling_price - a.purchase_price) / a.purchase_price)
      );
    
    profitableItems.slice(0, 2).forEach(product => {
      const margin = ((product.selling_price - product.purchase_price) / product.purchase_price * 100).toFixed(0);
      mockRecommendations.push({
        id: product.id,
        name: product.name,
        reason: `High profit margin of ${margin}%`,
        action: 'Increase marketing for this product',
        impact: 'Boost overall profitability',
        confidence: 80,
        category: product.category
      });
    });
    
    // Find items with long lead times
    const longLeadTimeItems = data
      .filter(p => p.lead_time > 10)
      .sort((a, b) => b.lead_time - a.lead_time);
    
    longLeadTimeItems.slice(0, 2).forEach(product => {
      mockRecommendations.push({
        id: product.id,
        name: product.name,
        reason: `Long lead time of ${product.lead_time} days`,
        action: 'Evaluate alternative suppliers',
        impact: 'Reduce lead time and improve inventory turnover',
        confidence: 75,
        category: product.category
      });
    });
    
    setRecommendations(mockRecommendations);
  };
  
  // Generate category insights
  const generateCategoryInsights = (data: Product[]) => {
    const categories = Array.from(new Set(data.map(p => p.category)));
    const insights: CategoryInsight[] = [];
    
    categories.forEach(category => {
      const categoryProducts = data.filter(p => p.category === category);
      
      // Calculate metrics
      const avgMargin = categoryProducts.reduce((sum, p) => 
        sum + ((p.selling_price - p.purchase_price) / p.purchase_price), 0) / categoryProducts.length;
      
      const stockHealth = categoryProducts.reduce((sum, p) => 
        sum + (p.current_stock >= p.reorder_level ? 1 : 0), 0) / categoryProducts.length;
      
      // Generate random growth rate between -20% and +40%
      const growth = Math.floor(Math.random() * 60) - 20;
      
      // Generate random turnover rate between 2 and 12
      const turnoverRate = 2 + Math.random() * 10;
      
      let recommendation = '';
      if (growth > 20) {
        recommendation = 'Increase inventory levels to meet growing demand';
      } else if (growth < 0) {
        recommendation = 'Reduce inventory and consider promotions';
      } else if (avgMargin > 0.3) {
        recommendation = 'Maintain current levels and optimize pricing';
      } else {
        recommendation = 'Evaluate supplier costs to improve margins';
      }
      
      insights.push({
        category,
        growth,
        stockHealth: stockHealth * 100,
        profitMargin: avgMargin * 100,
        turnoverRate,
        recommendation
      });
    });
    
    setCategoryInsights(insights);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  // Start camera for image recognition
  const startCamera = async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setImageRecognitionActive(true);
      
      // Show success message
      setSnackbarMessage('Camera started. Point at a product to scan.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setSnackbarMessage('Failed to access camera. Please check permissions.');
      setSnackbarOpen(true);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getTracks();
    
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setImageRecognitionActive(false);
  };
  
  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    
    // Draw video frame to canvas
    context.drawImage(
      videoRef.current, 
      0, 0, 
      canvasRef.current.width, 
      canvasRef.current.height
    );
    
    // Simulate AI image recognition
    simulateProductRecognition();
  };
  
  // Handle file upload for image recognition
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Simulate processing the image
    setLoading(true);
    setTimeout(() => {
      simulateProductRecognition();
      setLoading(false);
    }, 2000);
  };
  
  // Simulate product recognition (in a real app, this would use an AI model)
  const simulateProductRecognition = () => {
    // Randomly select a product from the inventory
    const randomIndex = Math.floor(Math.random() * products.length);
    const recognizedProduct = products[randomIndex];
    
    setRecognizedProduct(recognizedProduct);
    setSnackbarMessage(`Product recognized: ${recognizedProduct.name}`);
    setSnackbarOpen(true);
    
    // Stop camera after successful recognition
    if (imageRecognitionActive) {
      stopCamera();
    }
  };
  
  // Reset recognized product
  const resetRecognition = () => {
    setRecognizedProduct(null);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Psychology sx={{ mr: 1 }} /> Smart Inventory Analysis
      </Typography>
      
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab icon={<Lightbulb />} label="AI Recommendations" />
        <Tab icon={<BarChart />} label="Category Insights" />
        <Tab icon={<CameraAlt />} label="Image Recognition" />
        <Tab icon={<Psychology />} label="Smart Assistant" />
      </Tabs>
      
      {/* AI Recommendations Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI-Powered Inventory Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Our AI has analyzed your inventory data and generated the following recommendations to optimize your stock levels, 
                improve profitability, and enhance overall inventory management.
              </Typography>
            </Paper>
          </Grid>
          
          {recommendations.map((rec, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {rec.name}
                    </Typography>
                    <Chip 
                      label={`${rec.confidence}% confidence`}
                      color={rec.confidence > 90 ? "success" : rec.confidence > 75 ? "primary" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Category:</strong> {rec.category}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Reason:</strong> {rec.reason}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Recommended Action:</strong> {rec.action}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Expected Impact:</strong> {rec.impact}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                    <Button variant="contained" size="small" sx={{ ml: 1 }}>
                      Take Action
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Category Insights Tab */}
      {selectedTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Performance Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                AI-powered analysis of your inventory categories, showing growth trends, stock health, profitability, 
                and turnover rates with personalized recommendations.
              </Typography>
            </Paper>
          </Grid>
          
          {categoryInsights.map((insight, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {insight.category}
                    </Typography>
                    <Chip 
                      icon={insight.growth >= 0 ? <TrendingUp /> : <TrendingDown />}
                      label={`${insight.growth >= 0 ? '+' : ''}${insight.growth}% growth`}
                      color={insight.growth > 10 ? "success" : insight.growth < 0 ? "error" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Stock Health
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress 
                            variant="determinate" 
                            value={insight.stockHealth} 
                            color={insight.stockHealth > 75 ? "success" : insight.stockHealth > 50 ? "warning" : "error"}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary">
                              {`${Math.round(insight.stockHealth)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Profit Margin
                        </Typography>
                        <Typography variant="h6" component="div">
                          {insight.profitMargin.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Turnover Rate
                        </Typography>
                        <Typography variant="h6" component="div">
                          {insight.turnoverRate.toFixed(1)}x
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      AI Recommendation:
                    </Typography>
                    <Typography variant="body2">
                      {insight.recommendation}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<InsertChart />}
                    >
                      View Detailed Analysis
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Image Recognition Tab */}
      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI Image Recognition
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use your camera or upload an image to instantly identify products in your inventory. 
                Our AI will recognize the product and provide detailed information.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Scan Product
              </Typography>
              
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={imageRecognitionActive ? captureImage : startCamera}
                  disabled={recognizedProduct !== null}
                >
                  {imageRecognitionActive ? 'Capture Image' : 'Start Camera'}
                </Button>
                
                {imageRecognitionActive && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<FileUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageRecognitionActive || recognizedProduct !== null}
                >
                  Upload Image
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </Box>
              
              <Box sx={{ position: 'relative', width: '100%', height: 300, bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
                {imageRecognitionActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : recognizedProduct ? (
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    p: 2
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" gutterBottom color="primary">
                        Product Recognized!
                      </Typography>
                      <Typography variant="h6">
                        {recognizedProduct.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Category: {recognizedProduct.category}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={resetRecognition}
                        sx={{ mt: 2 }}
                      >
                        Scan Another
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    p: 2
                  }}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      Start camera or upload an image to scan a product
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              {recognizedProduct ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Product Details
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Product ID</Typography>
                      <Typography variant="body1">{recognizedProduct.id}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body1">{recognizedProduct.category}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Supplier</Typography>
                      <Typography variant="body1">{recognizedProduct.supplier}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Current Stock</Typography>
                      <Typography variant="body1">{recognizedProduct.current_stock}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Reorder Level</Typography>
                      <Typography variant="body1">{recognizedProduct.reorder_level}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Lead Time</Typography>
                      <Typography variant="body1">{recognizedProduct.lead_time} days</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Purchase Price</Typography>
                      <Typography variant="body1">${recognizedProduct.purchase_price.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Selling Price</Typography>
                      <Typography variant="body1">${recognizedProduct.selling_price.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    AI Analysis
                  </Typography>
                  
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      <strong>Stock Status:</strong> {
                        recognizedProduct.current_stock === 0 ? 'Out of stock' :
                        recognizedProduct.current_stock < recognizedProduct.reorder_level ? 'Low stock' :
                        recognizedProduct.current_stock > recognizedProduct.reorder_level * 3 ? 'Excess stock' :
                        'Optimal stock level'
                      }
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      <strong>Profit Margin:</strong> {
                        ((recognizedProduct.selling_price - recognizedProduct.purchase_price) / 
                        recognizedProduct.purchase_price * 100).toFixed(1)
                      }%
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>AI Recommendation:</strong> {
                        recognizedProduct.current_stock === 0 ? 'Restock immediately to avoid lost sales.' :
                        recognizedProduct.current_stock < recognizedProduct.reorder_level ? 'Place order soon to avoid stockout.' :
                        recognizedProduct.current_stock > recognizedProduct.reorder_level * 3 ? 'Consider running a promotion to reduce excess inventory.' :
                        'Maintain current inventory management strategy.'
                      }
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button variant="outlined" sx={{ mr: 1 }}>
                      View History
                    </Button>
                    <Button variant="contained">
                      Update Stock
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 3
                }}>
                  <CameraAlt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" align="center" gutterBottom>
                    No Product Scanned
                  </Typography>
                  <Typography variant="body1" align="center" color="text.secondary">
                    Use the camera or upload an image to scan a product and view its details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Smart Assistant Tab */}
      {selectedTab === 3 && (
        <SmartAssistant />
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SmartAnalysisPage;
