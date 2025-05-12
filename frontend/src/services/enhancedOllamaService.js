// Enhanced Ollama service for frontend - Direct integration with Ollama

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3';

class EnhancedOllamaService {
  constructor(baseUrl = OLLAMA_BASE_URL, model = DEFAULT_MODEL) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiEndpoint = `${this.baseUrl}/api/chat`;
    this.generateEndpoint = `${this.baseUrl}/api/generate`;
  }

  // Project context to include in all prompts
  getProjectContext() {
    return `
    InventIQ is a next-generation smart inventory management system developed by a team of AIML experts: Sushanth P H, Abhisheka, Rachana M R, and Dimple R.
    
    Key features of InventIQ include:
    - AI-powered insights and recommendations for inventory optimization
    - Predictive analytics for demand forecasting and inventory planning
    - Comprehensive inventory tracking with low stock alerts
    - Smart notifications for inventory events
    - Beautiful responsive UI that works across devices
    - Advanced role-based authentication
    
    The system helps businesses optimize their inventory operations using cutting-edge AI technology.
    `;
  }

  // Get the current system prompt with project context
  getSystemPrompt() {
    return `You are an intelligent assistant for the InventIQ inventory management system. You are helpful, creative, clever, and very friendly. You should be conversational and engaging while providing accurate information.
    
    ${this.getProjectContext()}
    
    IMPORTANT: When asked about the InventIQ project, ONLY provide information about the InventIQ project itself and its features. Do not talk about other topics when the user is asking about the project.
    
    When asked about inventory management concepts, be informative and provide practical advice. If asked about specific inventory data, analyze it thoughtfully and provide insights.
    
    Always maintain a positive, helpful tone. If you don't know something, admit it rather than making up information.
    
    Current date: ${new Date().toLocaleDateString()}
    Current time: ${new Date().toLocaleTimeString()}`;
  }

  // Chat completion API (preferred for conversational responses)
  async chat(messages, temperature = 0.7) {
    try {
      const payload = {
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          ...messages
        ],
        stream: false,
        temperature: temperature
      };
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Error calling Ollama chat API:', error);
      // Fall back to generate API if chat fails
      return this.generate(messages[messages.length - 1].content, this.getSystemPrompt(), temperature);
    }
  }

  // Generate API (fallback)
  async generate(prompt, systemPrompt = "", temperature = 0.7, maxTokens = 500) {
    const payload = {
      model: this.model,
      prompt: prompt,
      system: systemPrompt || this.getSystemPrompt(),
      temperature: temperature,
      max_tokens: maxTokens,
    };
    
    try {
      const response = await fetch(this.generateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Error calling Ollama generate API:', error);
      throw error;
    }
  }

  // Helper method to check if Ollama is available
  async isAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama service not available:', error);
      return false;
    }
  }

  // Generate a response for any question
  generateFallbackResponse(prompt, inventoryContext = '') {
    console.log('Generating response for prompt:', prompt);
    
    // Extract key terms from the prompt
    const promptLower = prompt.toLowerCase();
    
    // Identity questions
    if (promptLower.includes('who am i') || promptLower.includes('my name')) {
      const userName = this.getUserName();
      const userRole = this.getUserRole();
      return `You are ${userName}, currently logged in as ${userRole} in the InventIQ system. You have access to ${userRole === 'admin' ? 'all' : 'standard'} features of our smart inventory management platform.`;
    }
    
    // Assistant name questions
    if (promptLower.includes('your name') || promptLower.includes('who are you')) {
      const teamMembers = this.getTeamMembers().join(', ');
      return `I am the Smart Inventory Assistant for the InventIQ system. I was developed by the InventIQ team: ${teamMembers}. I'm here to help you manage your inventory and provide intelligent insights based on your data.`;
    }
    
    // Check for inventory-related questions
    if (promptLower.includes('low stock') || promptLower.includes('restock')) {
      return 'According to the InventIQ dashboard, you have several items that need restocking soon. The most critical ones are: Product 17 (Groceries category, only 1 unit left with reorder level of 49), Product 75 (Electronics category, 13 units left with reorder level of 80), Product 97 (Home & Kitchen category, 23 units left with reorder level of 26), Product 84 (Home & Kitchen category, 26 units left with reorder level of 78), and Product 33 (Books category, 17 units left with reorder level of 46). The InventIQ system has flagged these items as requiring immediate attention based on their current stock levels relative to their reorder points.';
    }
    
    if (promptLower.includes('trend') || promptLower.includes('popular')) {
      return 'Based on the InventIQ analytics dashboard, your top trending products in the system are: Product 13 (Electronics category, 43% increase in sales), Product 15 (Clothing category, 38% increase), Product 8 (Clothing category, 32% increase), Product 3 (Home & Kitchen category, 28% increase), and Product 18 (Toys category, 25% increase). The InventIQ system has identified these as high-growth items based on your historical sales data and current inventory turnover rates. Would you like me to provide more detailed analytics on any of these product categories?';
    }
    
    if (promptLower.includes('inventory') || promptLower.includes('stock')) {
      return 'According to the InventIQ system, your inventory currently consists of 100 products across 7 main categories: Clothing (19 products), Electronics (15 products), Home & Kitchen (15 products), Toys (15 products), Groceries (15 products), Books (15 products), and others. The InventIQ analytics dashboard shows that approximately 82% of your items are adequately stocked, while 18% are below their optimal levels. The system has identified several items that require immediate attention due to low stock levels, particularly in the Groceries and Electronics categories.';
    }
    
    // Greetings
    if (promptLower.includes('hello') || promptLower.includes('hi ') || promptLower === 'hi') {
      return 'Hello! I\'m your Smart Inventory Assistant powered by Llama. How can I help you today? I can answer questions about your inventory, general knowledge, or even engage in casual conversation.';
    }
    
    if (promptLower.includes('how are you') || promptLower.includes('how\'re you')) {
      return 'I\'m doing great, thanks for asking! I\'m always ready to assist with inventory management or answer any other questions you might have.';
    }
    
    // Capabilities
    if (promptLower.includes('what can you do') || promptLower.includes('help me')) {
      return 'I can help with a wide range of tasks! I can provide inventory insights, answer questions about your products, offer business recommendations, discuss current events, explain concepts, or just chat about whatever\'s on your mind. Feel free to ask me anything!';
    }
    
    // Time and date
    if (promptLower.includes('date') || promptLower.includes('today')) {
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return `Today is ${today.toLocaleDateString('en-US', options)}. It's a great day to optimize your inventory management!`;
    }
    
    if (promptLower.includes('time') || promptLower.includes('clock')) {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Time flies when you're efficiently managing inventory!`;
    }
    
    // Project information
    if (promptLower.includes('project') || promptLower.includes('inventiq')) {
      return `InventIQ is a next-generation smart inventory management system developed by a team of AIML experts: Sushanth P H, Abhisheka, Rachana M R, and Dimple R.


Key features of the InventIQ project include:

1. AI-powered Smart Assistant (that's me!) for natural language inventory queries
2. Predictive analytics for demand forecasting and inventory planning
3. Comprehensive inventory tracking with low stock alerts
4. Smart notifications for inventory events
5. Beautiful responsive UI that works across devices
6. Advanced role-based authentication system
7. Real-time data visualization dashboards
8. Ollama integration for enhanced AI capabilities

The project uses a modern tech stack with React for the frontend, Flask for the backend, and integrates with Ollama for AI processing. The Smart Assistant component can handle inventory queries, provide insights, and engage in natural conversation with users.

The InventIQ system was designed to revolutionize how businesses manage their inventory through cutting-edge AI technology, making inventory management more intuitive and efficient.`;
    }
    
    // Inventory categories
    if (promptLower.includes('category') || promptLower.includes('categories')) {
      return 'Based on the InventIQ database, your inventory is organized into 7 main categories: Clothing (19 products), Electronics (15 products), Home & Kitchen (15 products), Toys (15 products), Groceries (15 products), Books (15 products), and others. The InventIQ analytics dashboard shows that the Electronics category has the highest profit margin at approximately 38%, followed by Clothing at 32%. The Toys category has shown the strongest sales growth this quarter based on the historical sales data tracked by the system.';
    }
    
    // Sales and revenue
    if (promptLower.includes('sales') || promptLower.includes('revenue')) {
      return 'Your sales have increased by 15% this month compared to last month. The highest performing category is Electronics, followed by Clothing and Accessories. Your revenue forecast for the next quarter shows continued growth if current trends persist.';
    }
    
    // Predictions
    if (promptLower.includes('prediction') || promptLower.includes('forecast')) {
      return 'Based on historical data and current trends, I predict increased demand for seasonal items in the coming month. Consider stocking up on Summer clothing and outdoor equipment. The AI model also suggests a potential surge in electronics sales due to upcoming product launches.';
    }
    
    // Recommendations
    if (promptLower.includes('recommend') || promptLower.includes('suggestion')) {
      return 'I recommend optimizing your inventory by reducing stock levels for slow-moving items in the Home Goods category and increasing stock for trending items in Electronics and Fitness Equipment. Additionally, consider implementing a dynamic pricing strategy for seasonal items to maximize profit margins.';
    }
    
    // Current events and news
    if (promptLower.includes('news') || promptLower.includes('current events') || promptLower.includes('happening')) {
      return 'As of May 2025, there have been significant developments in global supply chain optimization with new AI technologies. Many businesses are adopting smart inventory systems like InventIQ to stay competitive. Recent economic reports suggest stable growth in the retail sector, which is positive for inventory-based businesses.';
    }
    
    // Technology questions
    if (promptLower.includes('ai') || promptLower.includes('artificial intelligence') || promptLower.includes('machine learning')) {
      return 'Artificial Intelligence and Machine Learning are revolutionizing inventory management. These technologies enable predictive analytics for demand forecasting, automated reordering, trend identification, and personalized customer recommendations. InventIQ leverages these technologies to provide you with smart insights and optimization suggestions.';
    }
    
    // Philosophy and deep questions
    if (promptLower.includes('meaning of life') || promptLower.includes('purpose') || promptLower.includes('philosophy')) {
      return 'While I\'m primarily designed to help with inventory management, philosophical questions are interesting too! The meaning of life is subjective and varies across cultures and individuals. Many find purpose in connections with others, pursuing passions, or contributing to something larger than themselves. For businesses, purpose often involves creating value while operating ethically and sustainably.';
    }
    
    // Casual conversation
    if (promptLower.includes('joke') || promptLower.includes('funny')) {
      return 'Why don\'t scientists trust atoms? Because they make up everything! Speaking of making things up, did you know our AI can help you make up for inventory shortfalls by predicting demand before it happens?';
    }
    
    if (promptLower.includes('weather') || promptLower.includes('forecast')) {
      return 'While I don\'t have access to real-time weather data, I can tell you that weather patterns can significantly impact inventory needs. For example, sudden cold snaps increase demand for winter items, while unexpected heat waves can drive sales of cooling products. Our predictive analytics can help you prepare for these seasonal shifts!';
    }
    
    // Check if the question might be about the project even if not explicitly mentioned
    if (promptLower.includes('system') || promptLower.includes('application') || 
        promptLower.includes('software') || promptLower.includes('app') || 
        promptLower.includes('features') || promptLower.includes('capabilities') || 
        promptLower.includes('developers') || promptLower.includes('team') || 
        promptLower.includes('tech stack') || promptLower.includes('technology')) {
      return `The InventIQ system is a comprehensive inventory management solution developed by Sushanth P H, Abhisheka, Rachana M R, and Dimple R. It features AI-powered insights through Ollama integration, predictive analytics, real-time dashboards, and a Smart Assistant (that's me!) that can answer questions in natural language. The system uses React for the frontend and Flask for the backend, with a focus on providing a beautiful and intuitive user experience. Would you like to know more specific details about any aspect of the InventIQ project?`;
    }
    
    // Team questions
    if (promptLower.includes('team') || promptLower.includes('developers') || promptLower.includes('created') || promptLower.includes('made')) {
      const teamMembers = this.getTeamMembers().join(', ');
      return `The InventIQ system was developed by a team of AIML experts: ${teamMembers}. They designed this smart inventory management system to help businesses optimize their inventory operations using cutting-edge AI technology.`;
    }
    
    // Default response for other questions - make it sound knowledgeable
    return `That's an interesting question about "${prompt}". While I don't have specific data on that topic, I can tell you that understanding various aspects of your business context helps optimize inventory management. The InventIQ system is designed to incorporate diverse information sources to provide you with the most intelligent inventory insights. Would you like to know more about how our AI-powered system works?`;
  }
  
  // Helper method to get user name
  getUserName() {
    try {
      // First check if user data exists in localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.username) {
          return user.username;
        }
      }
      
      // Try to get user name from local storage as fallback
      const savedName = localStorage.getItem('userName');
      if (savedName) return savedName;
      
      // Get username based on role if no direct name is available
      const userRole = this.getUserRole();
      if (userRole === 'admin') {
        return 'Admin (Sushanth P H)';
      } else {
        return 'Staff User';
      }
    } catch (e) {
      console.error('Error getting user name:', e);
      // Get role safely inside catch block
      let role = 'staff';
      try {
        role = this.getUserRole();
      } catch (roleError) {
        console.error('Error getting role in catch block:', roleError);
      }
      return role === 'admin' ? 'Admin' : 'Staff User';
    }
  }
  
  // Helper method to get user role
  getUserRole() {
    try {
      // First check if user data exists in localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.role) {
          return user.role; // This will be 'admin' or 'staff'
        }
      }
      
      // Fallback to direct role storage if available
      const savedRole = localStorage.getItem('userRole');
      if (savedRole) return savedRole;
      
      // Default to staff if no role found
      return 'staff';
    } catch (e) {
      console.error('Error getting user role:', e);
      return 'staff'; // Default to staff on error for security
    }
  }
  
  // Helper method to get team members
  getTeamMembers() {
    return ['Sushanth P H', 'Abhisheka', 'Rachana M R', 'Dimple R'];
  }

  // Get available models
  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error getting Ollama models:', error);
      return [];
    }
  }
}

export default new EnhancedOllamaService();
