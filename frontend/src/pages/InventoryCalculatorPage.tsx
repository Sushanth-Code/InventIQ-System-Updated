import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const InventoryCalculatorPage: React.FC = () => {
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [listingFee, setListingFee] = useState<number>(20);
  const [transactionFee, setTransactionFee] = useState<number>(0);
  const [referralFee, setReferralFee] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const calculateFees = () => {
    const newTransactionFee = (1.8 * sellingPrice) / 100;
    const newReferralFee = (4 * sellingPrice) / 100;
    const newTotalCost = cost + listingFee + newTransactionFee + newReferralFee;
    const newProfit = sellingPrice - newTotalCost;

    setTransactionFee(newTransactionFee);
    setReferralFee(newReferralFee);
    setTotalCost(newTotalCost);
    setProfit(newProfit);
    setRevenue(sellingPrice);

    // Update chart data
    const data = [
      { name: 'Revenue', value: sellingPrice },
      { name: 'Cost', value: cost },
      { name: 'Listing Fee', value: listingFee },
      { name: 'Transaction Fee', value: newTransactionFee },
      { name: 'Referral Fee', value: newReferralFee },
      { name: 'Profit', value: newProfit }
    ];
    setChartData(data);
  };

  const handleCalculate = () => {
    calculateFees();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Calculator</h1>
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Calculator</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Selling price"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Cost</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Cost"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <h3 className="font-medium">Revenue</h3>
                <div className="font-semibold">${revenue.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <h3 className="font-medium">Cost</h3>
                <div className="font-semibold">${cost.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <h3 className="font-medium">Listing Fee (4 months)</h3>
                <div className="font-semibold">${listingFee.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <h3 className="font-medium">Transaction Fee (1.8%)</h3>
                <div className="font-semibold">${transactionFee.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <h3 className="font-medium">Referral Fee (4%)</h3>
                <div className="font-semibold">${referralFee.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <h3 className="font-medium">Total Cost</h3>
                <div className="font-semibold">${totalCost.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <h3 className="font-medium">Profit</h3>
                <div className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profit.toFixed(2)}
                </div>
              </div>
              <button
                onClick={handleCalculate}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Calculate
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCalculatorPage; 