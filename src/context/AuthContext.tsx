import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  register: (name: string, email: string) => UserProfile;
  login: (email: string) => boolean;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AVATAR_COLORS = [
  'from-indigo-600 to-cyan-500',
  'from-emerald-500 to-teal-400',
  'from-purple-600 to-pink-500',
  'from-amber-500 to-rose-500',
  'from-blue-600 to-violet-500',
  'from-rose-500 to-orange-400',
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('roadify_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('roadify_users_db');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(!currentUser);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('roadify_current_user', JSON.stringify(currentUser));
      setIsAuthModalOpen(false);
    } else {
      localStorage.removeItem('roadify_current_user');
      setIsAuthModalOpen(true);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('roadify_users_db', JSON.stringify(usersList));
  }, [usersList]);

  const register = (name: string, email: string): UserProfile => {
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim() || 'Пользователь',
      email: email.trim().toLowerCase(),
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
    };

    setUsersList((prev) => [...prev.filter((u) => u.email !== newUser.email), newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const login = (email: string): boolean => {
    const found = usersList.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const updateProfile = (name: string, email: string) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
    };
    setCurrentUser(updated);
    setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    if (currentUser) setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        register,
        login,
        logout,
        updateProfile,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
