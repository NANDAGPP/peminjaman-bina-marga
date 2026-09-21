import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user' | null
  const [loading, setLoading] = useState(true);

  // Check active session on load
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth.php?action=me', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          setRole(data.role);
        } else {
          setUser(null);
          setRole(null);
        }
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (username, password, roleTarget = 'auto') => {
    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, role: roleTarget })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setRole(data.role);
        return { success: true, role: data.role, message: data.message };
      } else {
        return { success: false, message: data.message || 'Login gagal.' };
      }
    } catch {
      return { success: false, message: 'Gagal terhubung ke server backend.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth.php?action=logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
