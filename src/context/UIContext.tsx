import React, { createContext, useContext, useState, useCallback } from 'react';

// UIContext holds UI‑level state such as dark mode toggle, sidebar collapse, etc.
export type UIContextType = {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  return (
    <UIContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
