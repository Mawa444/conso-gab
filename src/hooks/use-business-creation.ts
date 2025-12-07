import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useBusinessCreation = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const openBusinessCreation = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  const closeBusinessCreation = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  const goToCreationPage = useCallback(() => {
    navigate('/entreprises/create');
  }, [navigate]);

  const handleBusinessCreated = useCallback((businessId: string) => {
    setShowCreateForm(false);
    toast.success('Entreprise créée avec succès !');
    navigate(`/business/${businessId}/profile`);
  }, [navigate]);

  const handleBusinessCreationCancelled = useCallback(() => {
    setShowCreateForm(false);
    navigate('/entreprises');
  }, [navigate]);

  return {
    showCreateForm,
    openBusinessCreation,
    closeBusinessCreation,
    goToCreationPage,
    handleBusinessCreated,
    handleBusinessCreationCancelled,
  };
};