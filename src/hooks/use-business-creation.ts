import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileMode } from '@/hooks/use-profile-mode';
import { toast } from 'sonner';

export const useBusinessCreation = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const { switchMode } = useProfileMode();

  const openBusinessCreation = () => {
    setShowCreateForm(true);
  };

  const closeBusinessCreation = () => {
    setShowCreateForm(false);
  };

  const handleBusinessCreated = (businessId: string) => {
    setShowCreateForm(false);
    toast.success("Entreprise créée avec succès !");
    
    // Redirection automatique vers le profil business nouvellement créé
    setTimeout(() => {
      switchMode('business', businessId, navigate);
    }, 1000);
  };

  const handleBusinessCreationCancelled = () => {
    setShowCreateForm(false);
  };

  return {
    showCreateForm,
    openBusinessCreation,
    closeBusinessCreation,
    handleBusinessCreated,
    handleBusinessCreationCancelled
  };
};