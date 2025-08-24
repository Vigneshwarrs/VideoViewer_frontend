import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const { user } = useAppStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;