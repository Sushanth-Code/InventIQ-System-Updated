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
import ollamaService from '../../services/ollamaService';

// Helper function to handle creator and identity questions
const handleCreatorQuestions = (query: string): string | null => {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('who created you') || queryLower.includes('who made you') || queryLower.includes('who developed you') || queryLower.includes('who built you')) {
    return "I was created by a talented team of AIML experts: Sushanth P H, Abhisheka, Rachana M R, and Dimple R. They developed me as part of the InventIQ inventory management system to help businesses optimize their inventory operations using cutting-edge AI technology. I'm designed to provide intelligent insights and recommendations based on your inventory data!";
  }
  
  if (queryLower.includes('what is your name') || queryLower.includes('who are you') || queryLower.includes('tell me about yourself')) {
    return "I am the Smart Inventory Assistant for InventIQ. I'm here to help you manage your inventory more efficiently by providing insights, answering questions, and offering recommendations based on your inventory data.";
  }
  
  if (queryLower.includes('hello') || queryLower.includes('hi ') || queryLower === 'hi' || queryLower.includes('hey')) {
    return "Hello! I'm your Smart Inventory Assistant. How can I help you with your inventory management today?";
  }
  
  if (queryLower.includes('how are you') || queryLower.includes('how\'re you') || queryLower.includes('how you doing')) {
    return "I'm functioning perfectly! As an AI assistant integrated with Ollama, I'm ready to help you with inventory management. I can show you low stock items, trending products, and provide insights about your inventory data. What would you like to know today?";
  }
  
  if (queryLower.includes('about project') || queryLower.includes('about inventiq') || queryLower.includes('tell me about') || queryLower.includes('project info')) {
    return "InventIQ is a next-generation smart inventory management system that revolutionizes how businesses handle their inventory. It features AI-powered insights, predictive analytics, comprehensive inventory tracking, and smart notifications. The system was developed by a team of AIML experts including Sushanth P H, Abhisheka, Rachana M R, and Dimple R. I'm the Smart Assistant component, powered by Ollama, designed to provide intelligent insights about your inventory data.";
  }
  
  if (queryLower.includes('features') || queryLower.includes('what can you do') || queryLower.includes('capabilities') || queryLower.includes('help me')) {
    return "I can help you with several inventory management tasks:\n\n1. Show you items with low stock that need restocking\n2. Identify trending or popular products based on sales data\n3. Provide inventory summaries and statistics\n4. Offer recommendations for inventory optimization\n5. Answer questions about specific products or categories\n\nJust ask me what you'd like to know about your inventory!";
  }
  
  // Handle date and time questions
  if (queryLower.includes('date') || queryLower.includes('today')) {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return `Today is ${today.toLocaleDateString('en-US', options)}. Now, how can I help you with your inventory management?`;
  }
  
  if (queryLower.includes('time') || queryLower.includes('clock')) {
    const now = new Date();
    return `The current time is ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. How can I assist you with your inventory today?`;
  }
  
  // Handle category questions
  if (queryLower.includes('categor')) {
    return "The main product categories in your inventory are: Electronics, Clothing, Home Goods, Toys, Office Supplies, and Food & Beverages. Each category has its own reorder levels and sales patterns. Which category would you like to know more about?";
  }
  
  // Handle general inventory questions
  if (queryLower.includes('inventory summary') || queryLower.includes('overview')) {
    return "Your current inventory consists of approximately 100 products across 6 categories. You have 21 items with low stock that need attention, and 5 items that are completely out of stock. Your best-performing category is Electronics with a 15% growth in sales this month.";
  }
  
  return null; // No match found
};

// Generate AI responses using Ollama directly
const generateAIResponse = async (query: string, inventoryData: any[]) => {
  // First check if it's a creator or identity question
  const creatorResponse = handleCreatorQuestions(query);
  if (creatorResponse) {
    return creatorResponse;
  }
  
  try {
    // Check if Ollama is available
    const isOllamaAvailable = await ollamaService.isAvailable();
    
    if (isOllamaAvailable) {
      // Prepare inventory data for Ollama
      const inventorySummary = prepareInventorySummary(inventoryData);
      
      // Create the system prompt
      const systemPrompt = "You are an intelligent inventory management assistant for InventIQ system. " + 
        "Your role is to provide accurate, helpful insights about inventory data. " + 
        "When asked about low stock items or trending products, always include specific product names and quantities. " + 
        "For restock recommendations, include a 30% buffer for trending or fast-moving products. " + 
        "Be concise but informative.";
      
      // Create the user prompt with inventory data
      const userPrompt = `Inventory Summary:
${JSON.stringify(inventorySummary, null, 2)}

User Query: ${query}

Provide a helpful response addressing the user's query based on the inventory data provided above.`;
      
      // Add a timeout to the Ollama request
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Ollama request timed out')), 5000); // 5 second timeout
      });

      try {
        // Generate response using Ollama with timeout
        const response = await Promise.race([
          ollamaService.generate(userPrompt, systemPrompt, 0.7, 500),
          timeoutPromise
        ]) as string;
        return response;
      } catch (error) {
        console.error('Error or timeout with Ollama:', error);
        throw error; // Let the catch block handle it
      }
    } else {
      throw new Error('Ollama service not available');
    }
  } catch (error) {
    console.error('Error getting AI insights:', error);
    
    // Fallback to basic responses if Ollama fails
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
          const aSum = aValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
          const bSum = bValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
          return bSum - aSum;
        })
        .slice(0, 5);
        
      return `Based on recent sales data, your top trending products are: 
        ${trendingItems.map(item => item.name).join(', ')}`;
    }
    
    return "I'm having trouble connecting to the Ollama service right now. Please make sure Ollama is running on your system.";
  }
}

// Helper function to prepare inventory summary for Ollama
const prepareInventorySummary = (inventoryData: any[]) => {
  // Create summary stats
  const summary: any = {
    total_products: inventoryData.length,
    categories: {},
    low_stock_items: []
  };
  
  // Get categories
  inventoryData.forEach(item => {
    if (item.category) {
      summary.categories[item.category] = (summary.categories[item.category] || 0) + 1;
    }
  });
  
  // Get low stock items
  const lowStockItems = inventoryData.filter(item => 
    item.current_stock <= item.reorder_level && item.current_stock > 0
  );
  
  summary.low_stock_count = lowStockItems.length;
  summary.out_of_stock_count = inventoryData.filter(item => item.current_stock === 0).length;
  
  // Add detailed low stock items
  summary.low_stock_items = lowStockItems.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    current_stock: item.current_stock,
    reorder_level: item.reorder_level
  }));
  
  // Add trending products based on historical sales if available
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
  
  summary.trending_products = trendingItems.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    total_sales: Object.values(item.historical_sales || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
  }));
  
  return summary;
}

// Smart Inventory Assistant Component
const SmartAssistant: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [loading, setLoading] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [listening, setListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  
  // Ref for messages container to auto-scroll
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventoryData();
    
    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = onresult;
      recognition.onend = onend;
      
      setSpeechRecognition(recognition);
    }
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
  
  // Handle speech recognition result
  const onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    setQuery(transcript);
    handleSubmit(transcript);
  };
  
  // Handle speech recognition end
  const onend = () => {
    setListening(false);
  };
  
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
      
      // Add AI message
      const aiMessage = {
        text: response,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Add error message
      const errorMessage = {
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
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
    const insights = [
      {
        title: 'Low Stock Alert',
        description: 'You have 5 items that need restocking soon.',
        icon: <InventoryIcon color="warning" />
      },
      {
        title: 'Trending Products',
        description: 'Electronics category is showing strong sales growth this month.',
        icon: <TrendingUpIcon color="success" />
      },
      {
        title: 'Inventory Health',
        description: 'Overall inventory turnover rate is 15% higher than last quarter.',
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
        Ask questions about your inventory in natural language and get intelligent insights powered by AI.
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
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" />
              <Typography variant="h6" component="h2">
                Smart Assistant
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Powered by Ollama AI
            </Typography>
          </Box>
          
          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  Start a conversation with your Smart Inventory Assistant
                </Typography>
              </Box>
            )}
            
            {messages.map((message, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    maxWidth: '80%',
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                    color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
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
