import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { inventoryService } from '../services/api';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  clearNotifications: () => void;
  clearSelectedNotifications: (ids: string[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Generate initial notifications based on inventory status
    const generateInitialNotifications = async () => {
      try {
        const products = await inventoryService.getAllProducts();
        
        const newNotifications: Notification[] = [];
        
        // Check for out of stock products
        const outOfStockProducts = products.filter((p: any) => p.current_stock === 0);
        if (outOfStockProducts.length > 0) {
          newNotifications.push({
            id: `out-of-stock-${Date.now()}`,
            message: `${outOfStockProducts.length} products are out of stock!`,
            type: 'error',
            timestamp: new Date(),
            read: false
          });
          
          // Add individual notifications for each out of stock product
          outOfStockProducts.forEach((product: any) => {
            newNotifications.push({
              id: `product-${product.id}-out-of-stock`,
              message: `${product.name} is out of stock.`,
              type: 'error',
              timestamp: new Date(),
              read: false
            });
          });
        }
        
        // Check for low stock products
        const lowStockProducts = products.filter((p: any) => p.current_stock > 0 && p.current_stock <= p.reorder_level);
        if (lowStockProducts.length > 0) {
          newNotifications.push({
            id: `low-stock-${Date.now()}`,
            message: `${lowStockProducts.length} products are running low!`,
            type: 'warning',
            timestamp: new Date(),
            read: false
          });
          
          // Add individual notifications for each low stock product
          lowStockProducts.forEach((product: any) => {
            newNotifications.push({
              id: `product-${product.id}-low-stock`,
              message: `${product.name} is running low (${product.current_stock} left).`,
              type: 'warning',
              timestamp: new Date(),
              read: false
            });
          });
        }
        
        // Add a welcome notification
        newNotifications.push({
          id: `welcome-${Date.now()}`,
          message: 'Welcome to InventIQ! Your smart inventory management system.',
          type: 'info',
          timestamp: new Date(),
          read: false
        });
        
        setNotifications(newNotifications);
      } catch (error) {
        console.error('Failed to generate initial notifications:', error);
      }
    };
    
    generateInitialNotifications();
  }, []);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const clearSelectedNotifications = (ids: string[]) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => !ids.includes(notification.id))
    );
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearNotifications,
        clearSelectedNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
