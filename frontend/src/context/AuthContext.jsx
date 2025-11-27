import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserImage from '../icons/user_image.png';
const AuthContext = createContext(null);
const ROLE_ORDER = ['regular', 'organizer', 'cashier', 'manager', 'superuser'];

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
  const location = useLocation();

  const [isOrganizer, setIsOrganizer] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  const clearSession = (redirectTo = '/login') => {
    setToken(null);
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('token');
    navigate(redirectTo, { replace: true });
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      setActiveRole(null);
      setLoading(false);
      setIsOrganizer(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unable to fetch profile');
        }

        const userData = await response.json();
        userData.avatarUrl = userData.avatarUrl ? `${API_BASE}${userData.avatarUrl}` : UserImage;
        setUser(userData);
        setActiveRole((prev) => {
          if (!prev) {
            return userData.role;
          }

          const prevIdx = ROLE_ORDER.indexOf(prev);
          const maxIdx = ROLE_ORDER.indexOf(userData.role);
          return prevIdx >= 0 && prevIdx <= maxIdx ? prev : userData.role;
        });


        // Event Organizer 
        try {
          const orgRes = await fetch(`${API_BASE}/users/me/organizer-events`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (orgRes.ok) {
            const orgData = await orgRes.json();
            setIsOrganizer(!!orgData.isOrganizer);
          } else {
            setIsOrganizer(false);
          }
        } catch {
          setIsOrganizer(false);
        }
        // Event Organizer END

      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchUserProfile();
  }, [token, API_BASE]);

  const login = async (utorid, password) => {
    setLoading(true);
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

      const profileResponse = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Unable to load profile');
      }

      const userData = await profileResponse.json();
      userData.avatarUrl = userData.avatarUrl ? `${API_BASE}${userData.avatarUrl}` : UserImage;
      setUser(userData);
      setActiveRole(userData.role);

      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession('/login');
  };

  const switchRole = (newRole) => {
    if (!user) {
      return false;
    }

    // const userRoleIndex = ROLE_ORDER.indexOf(user.role);
    // const requestedIndex = ROLE_ORDER.indexOf(newRole);

    // if (requestedIndex === -1 || userRoleIndex === -1) {
    //   return false;
    // }

    // if (requestedIndex <= userRoleIndex) {
    //   setActiveRole(newRole);
    //   return true;
    // }

    // return false;


    // only allow switching to a role that is in the precomputed availableRoles
    if (!availableRoles.includes(newRole)) {
    return false;
  }

  setActiveRole(newRole);
  return true;
  };

  const availableRoles = useMemo(() => {
    if (!user) {
      return [];
    }

    const roles = new Set();

    const idx = ROLE_ORDER.indexOf(user.role);
    if (idx === -1) {
      // return [user.role];
      roles.add(user.role);
    } else {
      for (let i = 0; i <= idx; i++) {
        roles.add(ROLE_ORDER[i]);
      }
    }

    if (isOrganizer) {
      roles.add('organizer');
    }



    return Array.from(roles).sort(
      (a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b)
    );
  }, [user, isOrganizer]);

  const hasRole = (role) => {
    if (!user) {
      return false;
    }

    const requiredIdx = ROLE_ORDER.indexOf(role);
    const userIdx = ROLE_ORDER.indexOf(user.role);

    if (requiredIdx === -1 || userIdx === -1) {
      return false;
    }

    return userIdx >= requiredIdx;
  };

  const updateUser = (updates) => {
    updates.avatarUrl = updates.avatarUrl ? `${API_BASE}${updates.avatarUrl}` : UserImage;
    setUser((prev) => ({
      ...prev,
      ...updates,   
    }));
  };

  const value = {
    user,
    token,
    loading,
    activeRole,
    availableRoles,
    isOrganizer, 
    login,
    logout,
    switchRole,
    isAuthenticated: !!token && !!user,
    hasRole,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
