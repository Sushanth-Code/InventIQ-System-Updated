import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import EditProductPage from './pages/EditProductPage';
import AddProductPage from './pages/AddProductPage';
import InventoryCalculatorPage from './pages/InventoryCalculatorPage';
import TrendsPage from './pages/TrendsPage';
import SmartAnalysisPage from './pages/SmartAnalysisPage';
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant';
import Layout from './components/common/Layout';
import './index.css';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <VoiceProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                />
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/add" element={<AddProductPage />} />
              <Route path="inventory/:productId" element={<ProductDetailPage />} />
              <Route path="inventory/edit/:productId" element={<EditProductPage />} />
              <Route path="calculator" element={<InventoryCalculatorPage />} />
              <Route path="trends" element={<TrendsPage />} />
              <Route path="smart-analysis" element={<SmartAnalysisPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <VoiceAssistant />
          </Router>
        </VoiceProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;