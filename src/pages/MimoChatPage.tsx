import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MimoChatProvider } from '@/contexts/MimoChatContext';
import { MimoChatLayout } from '@/components/mimo-chat/layout/MimoChatLayout';
import { ChatsTab } from '@/components/mimo-chat/tabs/ChatsTab';
import { ContactsTab } from '@/components/mimo-chat/tabs/ContactsTab';
import { CallsTab } from '@/components/mimo-chat/tabs/CallsTab';
import { SettingsTab } from '@/components/mimo-chat/tabs/SettingsTab';
import { Plus } from 'lucide-react';

export const MimoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chats':
        return <ChatsTab />;
      case 'contacts':
        return <ContactsTab />;
      case 'calls':
        return <CallsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ChatsTab />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'chats':
        return 'MIMO Chat';
      case 'contacts':
        return 'Contacts';
      case 'calls':
        return 'Appels';
      case 'settings':
        return 'Réglages';
      default:
        return 'MIMO Chat';
    }
  };

  const handleFABClick = () => {
    switch (activeTab) {
      case 'chats':
        // Open new conversation modal
        console.log('Nouvelle conversation');
        break;
      case 'contacts':
        // Open add contact modal
        console.log('Ajouter contact');
        break;
      case 'calls':
        // Open call modal
        console.log('Nouvel appel');
        break;
      default:
        break;
    }
  };

  return (
    <MimoChatProvider>
      <MimoChatLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title={getPageTitle()}
        showBackButton
        onBack={() => navigate('/')}
        showFAB={activeTab !== 'settings'}
        onFABClick={handleFABClick}
        fabIcon={<Plus className="w-6 h-6" />}
      >
        {renderActiveTab()}
      </MimoChatLayout>
    </MimoChatProvider>
  );
};

export default MimoChatPage;