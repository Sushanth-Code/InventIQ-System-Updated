import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Box, Typography, Paper, Grid, Slider, TextField, Button, Divider, Chip } from '@mui/material';
import { Calculate, TrendingUp, ShowChart, PieChartOutlined, BarChartOutlined, MonetizationOn } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const InventoryCalculatorPage: React.FC = () => {
  const [sellingPrice, setSellingPrice] = useState<number>(100);
  const [cost, setCost] = useState<number>(50);
  const [revenue, setRevenue] = useState<number>(0);
  const [listingFee, setListingFee] = useState<number>(20);
  const [transactionFee, setTransactionFee] = useState<number>(0);
  const [referralFee, setReferralFee] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [showResults, setShowResults] = useState<boolean>(false);

  // Calculate fees whenever inputs change
  useEffect(() => {
    calculateFees();
  }, [sellingPrice, cost]);

  const calculateFees = () => {
    const newTransactionFee = (1.8 * sellingPrice) / 100;
    const newReferralFee = (4 * sellingPrice) / 100;
    const newTotalCost = cost + listingFee + newTransactionFee + newReferralFee;
    const newProfit = sellingPrice - newTotalCost;
    const newProfitMargin = sellingPrice > 0 ? (newProfit / sellingPrice) * 100 : 0;

    setTransactionFee(newTransactionFee);
    setReferralFee(newReferralFee);
    setTotalCost(newTotalCost);
    setProfit(newProfit);
    setProfitMargin(newProfitMargin);
    setRevenue(sellingPrice);

    // Update chart data
    const data = [
      { name: 'Cost', value: cost, color: '#FF8042' },
      { name: 'Listing Fee', value: listingFee, color: '#FFBB28' },
      { name: 'Transaction Fee', value: newTransactionFee, color: '#00C49F' },
      { name: 'Referral Fee', value: newReferralFee, color: '#0088FE' },
      { name: 'Profit', value: newProfit > 0 ? newProfit : 0, color: '#8884D8' }
    ];
    setChartData(data);
  };

  const handleCalculate = () => {
    calculateFees();
    setShowResults(true);
  };

  const toggleChartType = () => {
    setChartType(chartType === 'pie' ? 'bar' : 'pie');
  };

  return (
    <Box className="p-6">
      <Paper elevation={3} className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <Typography variant="h4" className="mb-4 text-center font-bold text-primary flex items-center justify-center">
          <Calculate fontSize="large" className="mr-2" />
          Inventory Profit Calculator
          <MonetizationOn fontSize="large" className="ml-2 text-yellow-500" />
        </Typography>
        
        <Typography variant="subtitle1" className="mb-6 text-center text-gray-600">
          Calculate your profit margins and visualize cost breakdowns with our advanced calculator
        </Typography>
        
        <Grid container spacing={4}>
          {/* Input Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={2} className="p-4 h-full bg-white">
              <Typography variant="h6" className="mb-4 flex items-center">
                <ShowChart className="mr-2 text-primary" />
                Input Parameters
              </Typography>
              
              <Box className="mb-4">
                <Typography gutterBottom>Selling Price: ${sellingPrice}</Typography>
                <Slider
                  value={sellingPrice}
                  onChange={(_, value) => setSellingPrice(value as number)}
                  min={0}
                  max={500}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  className="text-primary"
                />
                <TextField
                  label="Selling Price ($)"
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Box>
              
              <Box className="mb-4">
                <Typography gutterBottom>Product Cost: ${cost}</Typography>
                <Slider
                  value={cost}
                  onChange={(_, value) => setCost(value as number)}
                  min={0}
                  max={300}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  className="text-orange-500"
                />
                <TextField
                  label="Product Cost ($)"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Box>
              
              <Box className="mb-4">
                <Typography gutterBottom>Listing Fee: ${listingFee}</Typography>
                <Slider
                  value={listingFee}
                  onChange={(_, value) => setListingFee(value as number)}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  className="text-yellow-500"
                />
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleCalculate}
                startIcon={<Calculate />}
                className="mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Calculate Profit
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                size="medium"
                onClick={toggleChartType}
                startIcon={chartType === 'pie' ? <BarChartOutlined /> : <PieChartOutlined />}
                className="mt-2"
              >
                Switch to {chartType === 'pie' ? 'Bar' : 'Pie'} Chart
              </Button>
            </Paper>
          </Grid>
          
          {/* Results Section */}
          <Grid item xs={12} md={7}>
            <Paper elevation={2} className="p-4 h-full bg-white">
              <Typography variant="h6" className="mb-4 flex items-center">
                <TrendingUp className="mr-2 text-green-600" />
                Profit Analysis
              </Typography>
              
              <Grid container spacing={2} className="mb-4">
                <Grid item xs={6}>
                  <Paper elevation={1} className="p-3 bg-blue-50 h-full">
                    <Typography variant="subtitle2" className="text-gray-600">Revenue</Typography>
                    <Typography variant="h5" className="font-bold text-primary">${revenue.toFixed(2)}</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6}>
                  <Paper elevation={1} className="p-3 bg-orange-50 h-full">
                    <Typography variant="subtitle2" className="text-gray-600">Total Cost</Typography>
                    <Typography variant="h5" className="font-bold text-orange-600">${totalCost.toFixed(2)}</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6}>
                  <Paper elevation={1} className={`p-3 ${profit >= 0 ? 'bg-green-50' : 'bg-red-50'} h-full`}>
                    <Typography variant="subtitle2" className="text-gray-600">Profit</Typography>
                    <Typography variant="h5" className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${profit.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6}>
                  <Paper elevation={1} className={`p-3 ${profitMargin >= 0 ? 'bg-green-50' : 'bg-red-50'} h-full`}>
                    <Typography variant="subtitle2" className="text-gray-600">Profit Margin</Typography>
                    <Typography variant="h5" className={`font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitMargin.toFixed(2)}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Divider className="my-4" />
              
              <Typography variant="subtitle1" className="mb-2">Cost Breakdown</Typography>
              
              <Box className="flex flex-wrap gap-2 mb-4">
                <Chip label={`Product Cost: $${cost.toFixed(2)}`} color="warning" />
                <Chip label={`Listing Fee: $${listingFee.toFixed(2)}`} color="secondary" />
                <Chip label={`Transaction Fee (1.8%): $${transactionFee.toFixed(2)}`} color="info" />
                <Chip label={`Referral Fee (4%): $${referralFee.toFixed(2)}`} color="primary" />
              </Box>
              
              <Box className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="value" name="Amount ($)">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Box>
              
              {profit > 0 && (
                <Box className="mt-4 p-3 bg-green-50 rounded-lg">
                  <Typography variant="subtitle1" className="font-bold text-green-700">
                    Wow! Your profit margin is {profitMargin.toFixed(2)}%! 🚀
                  </Typography>
                  <Typography variant="body2" className="text-green-600">
                    {profitMargin > 30 ? 
                      'Excellent profit margin! This product is highly profitable.' : 
                      'Good profit margin. Consider optimizing costs to increase profitability.'}
                  </Typography>
                </Box>
              )}
              
              {profit <= 0 && (
                <Box className="mt-4 p-3 bg-red-50 rounded-lg">
                  <Typography variant="subtitle1" className="font-bold text-red-700">
                    Warning: This product is not profitable! ⚠️
                  </Typography>
                  <Typography variant="body2" className="text-red-600">
                    Consider increasing your selling price or finding ways to reduce costs.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default InventoryCalculatorPage; 