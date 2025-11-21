import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(null);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setActiveRole(userData.role);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (utorid, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ utorid, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      
      // Fetch user profile after login
      const userResponse = await fetch(`${API_BASE}/users/me`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        setActiveRole(userData.role);
        navigate('/dashboard');
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const switchRole = (newRole) => {
    // Validate that user has access to this role
    const roleHierarchy = ['regular', 'cashier', 'manager', 'superuser'];
    const userRoleIndex = roleHierarchy.indexOf(user?.role);
    const newRoleIndex = roleHierarchy.indexOf(newRole);

    if (newRoleIndex <= userRoleIndex) {
      setActiveRole(newRole);
      return true;
    }
    return false;
  };

  const value = {
    user,
    token,
    loading,
    activeRole,
    login,
    logout,
    switchRole,
    isAuthenticated: !!token && !!user,
    hasRole: (role) => {
      const roleHierarchy = ['regular', 'cashier', 'manager', 'superuser'];
      const userRoleIndex = roleHierarchy.indexOf(user?.role);
      const requiredRoleIndex = roleHierarchy.indexOf(role);
      return userRoleIndex >= requiredRoleIndex;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
