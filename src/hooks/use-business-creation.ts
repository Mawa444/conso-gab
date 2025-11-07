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
    navigate('/entreprises');
  };

  const handleBusinessCreated = (businessId: string) => {
    setShowCreateForm(false);
    toast.success("Entreprise créée avec succès !");
    
    // Redirection directe - l'utilisateur vient de créer le business donc il en est propriétaire
    navigate(`/business/${businessId}/profile`);
  };

  const handleBusinessCreationCancelled = () => {
    setShowCreateForm(false);
    navigate('/entreprises');
  };

  return {
    showCreateForm,
    openBusinessCreation,
    closeBusinessCreation,
    handleBusinessCreated,
    handleBusinessCreationCancelled
  };
};