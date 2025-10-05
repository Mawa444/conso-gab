import { useState, useCallback } from 'react';

export interface HomePageUIState {
  showScanner: boolean;
  showOperatorDashboard: boolean;
}

export interface HomePageDataState {
  scannedCommerce: any;
  selectedCommerce: any;
}

export interface HomePageActions {
  openScanner: () => void;
  closeScanner: () => void;
  setScannedCommerce: (commerce: any) => void;
  clearScannedCommerce: () => void;
  setSelectedCommerce: (commerce: any) => void;
  clearSelectedCommerce: () => void;
  toggleOperatorDashboard: () => void;
  closeOperatorDashboard: () => void;
}

export interface HomePageState {
  ui: HomePageUIState;
  data: HomePageDataState;
  actions: HomePageActions;
}

const initialUIState: HomePageUIState = {
  showScanner: false,
  showOperatorDashboard: false,
};

const initialDataState: HomePageDataState = {
  scannedCommerce: null,
  selectedCommerce: null,
};

export const useHomePageState = (): HomePageState => {
  const [ui, setUI] = useState<HomePageUIState>(initialUIState);
  const [data, setData] = useState<HomePageDataState>(initialDataState);

  const actions: HomePageActions = {
    openScanner: useCallback(() => {
      setUI(prev => ({ ...prev, showScanner: true }));
    }, []),

    closeScanner: useCallback(() => {
      setUI(prev => ({ ...prev, showScanner: false }));
    }, []),

    setScannedCommerce: useCallback((commerce: any) => {
      setData(prev => ({ ...prev, scannedCommerce: commerce }));
      setUI(prev => ({ ...prev, showScanner: false }));
    }, []),

    clearScannedCommerce: useCallback(() => {
      setData(prev => ({ ...prev, scannedCommerce: null }));
    }, []),

    setSelectedCommerce: useCallback((commerce: any) => {
      setData(prev => ({ ...prev, selectedCommerce: commerce }));
    }, []),

    clearSelectedCommerce: useCallback(() => {
      setData(prev => ({ ...prev, selectedCommerce: null }));
    }, []),

    toggleOperatorDashboard: useCallback(() => {
      setUI(prev => ({ ...prev, showOperatorDashboard: !prev.showOperatorDashboard }));
    }, []),

    closeOperatorDashboard: useCallback(() => {
      setUI(prev => ({ ...prev, showOperatorDashboard: false }));
    }, []),
  };

  return {
    ui,
    data,
    actions,
  };
};