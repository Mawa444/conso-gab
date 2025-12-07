import React, { createContext, useContext, useState, useCallback } from 'react';

export interface BusinessFormData {
  // Étape 1: Informations de base
  businessName: string;
  businessCategory: string;
  description: string;
  
  // Étape 2: Localisation
  country: string;
  province: string;
  department: string;
  arrondissement: string;
  quartier: string;
  address: string;
  latitude?: number;
  longitude?: number;
  
  // Étape 3: Contact
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
}

const initialFormData: BusinessFormData = {
  businessName: '',
  businessCategory: '',
  description: '',
  country: 'Gabon',
  province: '',
  department: '',
  arrondissement: '',
  quartier: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
};

interface BusinessCreationContextType {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
  resetFormData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  canGoNext: boolean;
  canGoBack: boolean;
  goNext: () => void;
  goBack: () => void;
}

const BusinessCreationContext = createContext<BusinessCreationContextType | undefined>(undefined);

export const BusinessCreationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<BusinessFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const updateFormData = useCallback((data: Partial<BusinessFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
  }, []);

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(formData.businessName.trim() && formData.businessCategory && formData.description.trim());
      case 2:
        return !!(formData.province || (formData.latitude && formData.longitude));
      case 3:
        return true; // Contact est optionnel
      default:
        return false;
    }
  }, [currentStep, formData]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps && canGoNext()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, canGoNext]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  return (
    <BusinessCreationContext.Provider value={{
      formData,
      updateFormData,
      resetFormData,
      currentStep,
      setCurrentStep,
      totalSteps,
      canGoNext: canGoNext(),
      canGoBack: currentStep > 1,
      goNext,
      goBack,
    }}>
      {children}
    </BusinessCreationContext.Provider>
  );
};

export const useBusinessCreationContext = () => {
  const context = useContext(BusinessCreationContext);
  if (!context) {
    throw new Error('useBusinessCreationContext must be used within BusinessCreationProvider');
  }
  return context;
};
