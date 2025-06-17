import React, { createContext, useContext, useState } from 'react';

type LayerPanelContextType = {
  isVisible: boolean;
  showLayerControl: () => void;
  hideLayerControl: () => void;
  toggleLayerControl: () => void;
};

const LayerPanelContext = createContext<LayerPanelContextType | undefined>(undefined);

export const LayerPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  const showLayerControl = () => setIsVisible(true);
  const hideLayerControl = () => setIsVisible(false);
  const toggleLayerControl = () => setIsVisible(prev => !prev);

  return (
    <LayerPanelContext.Provider value={{ isVisible, showLayerControl: showLayerControl, hideLayerControl: hideLayerControl, toggleLayerControl: toggleLayerControl }}>
      {children}
    </LayerPanelContext.Provider>
  );
};

export const useLayerPanel = () => {
  const context = useContext(LayerPanelContext);
  if (!context) throw new Error('useLayerPanel must be used within a LayerPanelProvider');
  return context;
};
