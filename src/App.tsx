import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { authAPI } from './services/api';
import { wsService } from './services/websocket';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './pages/Dashboard';
import VideoViewer from './pages/VideoViewer';

const App: React.FC = () => {
  const { user, setUser, setLoading } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setLoading(true);
          const userData = await authAPI.verifyToken();
          setUser(userData);
          wsService.connect(token);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeApp();
  }, [setUser, setLoading]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to={user?.role === 'admin' ? '/dashboard' : '/video-viewer'} />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="video-viewer" element={<VideoViewer />} />
            <Route path="analytics" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;