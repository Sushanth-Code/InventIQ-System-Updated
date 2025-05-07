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
  Mic as MicIcon,
  MicOff as MicOffIcon,
  AutoGraph as AutoGraphIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { inventoryService, predictionService } from '../../services/api';

// Mock AI responses
const generateAIResponse = async (query: string, inventoryData: any[]) => {
  // Wait to simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Convert query to lowercase for easier matching
  const queryLower = query.toLowerCase();
  
  // Check for various query intents
  if (queryLower.includes('low stock') || queryLower.includes('restock')) {
    const lowStockItems = inventoryData.filter(item => 
      item.current_stock <= item.reorder_level && item.current_stock > 0
    );
    
    if (lowStockItems.length === 0) {
      return "Good news! You don't have any items that need restocking at the moment.";
    }
    
    return `I found ${lowStockItems.length} items that need restocking soon. The most critical ones are: 
      ${lowStockItems.slice(0, 3).map(item => `${item.name} (${item.current_stock}/${item.reorder_level})`).join(', ')}`;
  }
  
  if (queryLower.includes('trend') || queryLower.includes('trending') || queryLower.includes('popular')) {
    const trendingItems = inventoryData
      .filter(item => item.historical_sales)
      .sort((a, b) => {
        const aValues = Object.values(a.historical_sales || {}) as number[];
        const bValues = Object.values(b.historical_sales || {}) as number[];
        const aSum = aValues.reduce((sum: number, val: number) => sum + val, 0);
        const bSum = bValues.reduce((sum: number, val: number) => sum + val, 0);
        return bSum - aSum;
      })
      .slice(0, 5);
      
    return `Based on recent sales data, your top trending products are: 
      ${trendingItems.map(item => item.name).join(', ')}`;
  }
  
  if (queryLower.includes('predict') || queryLower.includes('forecast') || queryLower.includes('future')) {
    return "Based on your current inventory and sales patterns, I predict you'll need to restock Electronics and Toys categories within the next 2 weeks. Would you like me to generate a detailed forecast report?";
  }
  
  if (queryLower.includes('optimize') || queryLower.includes('recommendation') || queryLower.includes('suggest')) {
    return "I've analyzed your inventory patterns and have some optimization suggestions: 1) Consider reducing stock levels for 'Product 17' which has slow movement, 2) Increase reorder levels for fast-moving items in the Electronics category, 3) Review your supplier for Clothing items as they have the longest lead times.";
  }
  
  if (queryLower.includes('summary') || queryLower.includes('overview')) {
    const totalStock = inventoryData.reduce((sum, item) => sum + item.current_stock, 0);
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.current_stock * item.purchase_price), 0);
    const categories = Array.from(new Set(inventoryData.map(item => item.category)));
    
    return `Inventory Summary: You have ${inventoryData.length} products across ${categories.length} categories with a total of ${totalStock} units in stock. The estimated inventory value is $${totalValue.toFixed(2)}. Your healthiest category is ${categories[0]} and your most profitable is Electronics.`;
  }
  
  // Check for questions about creators or user's name
  if (queryLower.includes('who created you') || queryLower.includes('who made you') || queryLower.includes('who developed you') || queryLower.includes('who built you')) {
    return "I was created by a talented team of AIML experts: Sushanth P H, Abhisheka, Rachana M R, and Dimple R. They developed me as part of the InventIQ inventory management system to help businesses optimize their inventory operations using cutting-edge AI technology. I'm designed to provide intelligent insights and recommendations based on your inventory data!";
  }
  
  if (queryLower.includes('what is my name') || queryLower.includes('who am i') || queryLower.includes('what\'s my name') || queryLower.includes('whats my name')) {
    return "You are Sushanth P H, one of the brilliant minds behind my creation! You worked alongside Abhisheka, Rachana M R, and Dimple R to develop this advanced AI-powered inventory management system. It's a pleasure to assist you with your inventory management needs!";
  }
  
  // Default response for other queries
  return "I'm your AI inventory assistant. I can help you analyze stock levels, identify trends, optimize inventory, and predict future needs. What would you like to know about your inventory?";
};

// Smart Inventory Assistant Component
const SmartAssistant: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'ai', timestamp: Date}[]>([
    {
      text: "Hello! I'm your AI inventory assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [listening, setListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  
  // Fetch inventory data on component mount
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await inventoryService.getAllProducts();
        setInventoryData(data);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    };
    
    fetchInventoryData();
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSubmit(transcript);
      };
      
      recognition.onend = () => {
        setListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
  }, []);
  
  // Handle query submission
  const handleSubmit = async (submittedQuery: string = query) => {
    if (!submittedQuery.trim()) return;
    
    // Add user message
    const userMessage = {
      text: submittedQuery,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setQuery('');
    
    try {
      // Get AI response
      const response = await generateAIResponse(submittedQuery, inventoryData);
      
      // Add AI response
      const aiMessage = {
        text: response,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechRecognition) return;
    
    if (listening) {
      speechRecognition.stop();
      setListening(false);
    } else {
      speechRecognition.start();
      setListening(true);
    }
  };
  
  // Generate AI insights
  const getAIInsights = () => {
    if (!inventoryData.length) return [];
    
    return [
      {
        title: "Stock Optimization",
        description: "5 products have excess stock levels that could be optimized to reduce carrying costs.",
        icon: <InventoryIcon color="primary" />
      },
      {
        title: "Trend Alert",
        description: "Electronics category is showing a 15% increase in sales over the last 30 days.",
        icon: <TrendingUpIcon color="success" />
      },
      {
        title: "Restock Recommendation",
        description: "3 products will reach critical stock levels within the next 7 days.",
        icon: <LightbulbIcon color="warning" />
      },
      {
        title: "Demand Forecast",
        description: "Predicted 22% increase in demand for Toys category in the upcoming month.",
        icon: <AutoGraphIcon color="info" />
      },
      {
        title: "Inventory Health",
        description: "Your overall inventory health score is 82/100, up 3 points from last month.",
        icon: <BarChartIcon color="secondary" />
      }
    ];
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PsychologyIcon sx={{ mr: 1 }} /> Smart Inventory Assistant
      </Typography>
      
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2 }}>
        {/* Chat Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 200px)',
            overflow: 'hidden'
          }}
        >
          {/* Messages */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.map((message, index) => (
              <Box 
                key={index} 
                sx={{ 
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px'
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
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
          </Box>
          
          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask me about your inventory..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                size="small"
              />
              <IconButton 
                color={listening ? "error" : "primary"}
                onClick={toggleListening}
                disabled={!speechRecognition}
              >
                {listening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
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
              Try asking: "Show me low stock items" or "What are the trending products?"
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
