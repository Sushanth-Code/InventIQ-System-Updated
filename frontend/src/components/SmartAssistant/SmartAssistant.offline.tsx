import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Send as SendIcon, 
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore,
  ExpandLess,
  AutoGraph as AutoGraphIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { inventoryService, predictionService } from '../../services/api';
import enhancedOllamaService from '../../services/enhancedOllamaService';

// Smart Inventory Assistant Component with offline capability
const SmartAssistant: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, role: 'user' | 'assistant', timestamp: Date}>>([]);
  const [loading, setLoading] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  
  // Ref for messages container to auto-scroll
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventoryData();
    
    // Add welcome message
    const welcomeMessage = {
      text: "Hello! I'm your Smart Inventory Assistant. I can help you manage your inventory, provide insights, and answer any questions you might have. What would you like to know today?",
      role: 'assistant' as const,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);
  
  // Fetch inventory data from API
  const fetchInventoryData = async () => {
    try {
      const data = await inventoryService.getAllProducts();
      setInventoryData(data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Prepare inventory context for AI
  const prepareInventoryContext = () => {
    // Count categories
    const categories: {[key: string]: number} = {};
    inventoryData.forEach(item => {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }
    });

    // Get low stock items
    const lowStockItems = inventoryData.filter(item => 
      item.current_stock <= item.reorder_level && item.current_stock > 0
    );

    // Get trending products
    const trendingItems = inventoryData
      .filter(item => item.historical_sales)
      .sort((a, b) => {
        const aValues = Object.values(a.historical_sales || {}) as number[];
        const bValues = Object.values(b.historical_sales || {}) as number[];
        const aSum = aValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        const bSum = bValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        return bSum - aSum;
      })
      .slice(0, 5);

    return `
    Current Inventory Context:
    - Total Products: ${inventoryData.length}
    - Categories: ${Object.keys(categories).join(', ')}
    - Low Stock Items: ${lowStockItems.length} items need restocking
    - Top Trending Products: ${trendingItems.map(item => item.name).join(', ')}
    `;
  };
  
  // Handle query submission
  const handleSubmit = async (submittedQuery: string = query) => {
    if (!submittedQuery.trim()) return;
    
    // Add user message
    const userMessage = {
      text: submittedQuery,
      role: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setQuery('');
    
    try {
      // Get inventory context
      const inventoryContext = prepareInventoryContext();
      
      // Use the fallback response generator directly
      const response = enhancedOllamaService.generateFallbackResponse(submittedQuery, inventoryContext);
      
      // Add AI message
      const aiMessage = {
        text: response,
        role: 'assistant' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Add error message
      const errorMessage = {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        role: 'assistant' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate AI insights
  const getAIInsights = () => {
    // Count low stock items
    const lowStockCount = inventoryData.filter(item => 
      item.current_stock <= item.reorder_level && item.current_stock > 0
    ).length;
    
    // Get categories
    const categories = Array.from(new Set(inventoryData.map(item => item.category)));
    
    // Get trending products
    const trendingItems = inventoryData
      .filter(item => item.historical_sales)
      .sort((a, b) => {
        const aValues = Object.values(a.historical_sales || {}) as number[];
        const bValues = Object.values(b.historical_sales || {}) as number[];
        const aSum = aValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        const bSum = bValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
        return bSum - aSum;
      })
      .slice(0, 5);
    
    const insights = [
      {
        title: 'Low Stock Alert',
        description: `You have ${lowStockCount} items that need restocking soon.`,
        icon: <InventoryIcon color="warning" />
      },
      {
        title: 'Trending Products',
        description: `Top trending: ${trendingItems.map(item => item.name).slice(0, 2).join(', ')}`,
        icon: <TrendingUpIcon color="success" />
      },
      {
        title: 'Inventory Health',
        description: `${inventoryData.length} products across ${categories.length} categories`,
        icon: <AutoGraphIcon color="info" />
      },
      {
        title: 'Seasonal Prediction',
        description: 'Based on historical data, prepare for increased demand in Clothing next month.',
        icon: <BarChartIcon color="primary" />
      },
      {
        title: 'Optimization Tip',
        description: 'Consider reducing stock levels for slow-moving items in Home Goods category.',
        icon: <LightbulbIcon color="secondary" />
      }
    ];
    
    return insights;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Smart Inventory Assistant
      </Typography>
      
      <Typography variant="body1" paragraph>
        Ask questions about your inventory in natural language and get intelligent insights.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
        {/* Chat Interface */}
        <Paper 
          elevation={3} 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: 'calc(100vh - 200px)',
            maxWidth: '800px'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" />
              <Typography variant="h6" component="h2">
                Smart Assistant
              </Typography>
              <Chip 
                label="Offline Mode" 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
          </Box>
          
          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    maxWidth: '80%',
                    bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                    color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask me anything about inventory..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                size="small"
              />
              <Button 
                variant="contained" 
                endIcon={<SendIcon />}
                onClick={() => handleSubmit()}
                disabled={loading || !query.trim()}
              >
                Send
              </Button>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Try asking: "What are the trending products?", "Do I have any low stock items?", or "Give me an inventory summary"
            </Typography>
          </Box>
        </Paper>
        
        {/* AI Insights Panel */}
        <Paper 
          elevation={3} 
          sx={{ 
            width: 300, 
            display: { xs: 'none', md: 'flex' }, 
            flexDirection: 'column',
            height: 'calc(100vh - 200px)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h3">
              AI Insights
            </Typography>
            <IconButton size="small" onClick={() => setInsightsOpen(!insightsOpen)}>
              {insightsOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={insightsOpen} sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <List>
              {getAIInsights().map((insight, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ px: 2, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {insight.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={insight.title}
                    secondary={insight.description}
                    primaryTypographyProps={{ fontWeight: 'bold', variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ p: 2 }}>
              <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    AI Recommendation
                  </Typography>
                  <Typography variant="body2">
                    Based on your current inventory patterns, consider running a promotion for Clothing items to reduce excess stock before the season change.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Collapse>
        </Paper>
      </Box>
    </Box>
  );
};

export default SmartAssistant;
