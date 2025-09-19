import { useState } from "react";
import { Settings, Bell, User, Shield, Palette, Zap, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const CommunicationSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      orders: true,
      appointments: true,
      campaigns: false,
      sound: true,
      desktop: true,
      mobile: true
    },
    privacy: {
      onlineStatus: true,
      readReceipts: true,
      typing: true,
      profileVisibility: "public"
    },
    preferences: {
      theme: "system",
      language: "fr",
      timezone: "Africa/Libreville",
      messagePreview: true
    },
    integration: {
      whatsapp: false,
      telegram: false,
      email: true,
      sms: true
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Paramètres de communication</h1>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="messages-notif">Nouveaux messages</Label>
                <Switch
                  id="messages-notif"
                  checked={settings.notifications.messages}
                  onCheckedChange={(checked) => updateSetting('notifications', 'messages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="orders-notif">Commandes</Label>
                <Switch
                  id="orders-notif"
                  checked={settings.notifications.orders}
                  onCheckedChange={(checked) => updateSetting('notifications', 'orders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="appointments-notif">Rendez-vous</Label>
                <Switch
                  id="appointments-notif"
                  checked={settings.notifications.appointments}
                  onCheckedChange={(checked) => updateSetting('notifications', 'appointments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="campaigns-notif">Campagnes</Label>
                <Switch
                  id="campaigns-notif"
                  checked={settings.notifications.campaigns}
                  onCheckedChange={(checked) => updateSetting('notifications', 'campaigns', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-notif">Sons de notification</Label>
                <Switch
                  id="sound-notif"
                  checked={settings.notifications.sound}
                  onCheckedChange={(checked) => updateSetting('notifications', 'sound', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="desktop-notif">Notifications bureau</Label>
                <Switch
                  id="desktop-notif"
                  checked={settings.notifications.desktop}
                  onCheckedChange={(checked) => updateSetting('notifications', 'desktop', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="mobile-notif">Notifications mobile</Label>
                <Switch
                  id="mobile-notif"
                  checked={settings.notifications.mobile}
                  onCheckedChange={(checked) => updateSetting('notifications', 'mobile', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidentialité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="online-status">Statut en ligne visible</Label>
                <Switch
                  id="online-status"
                  checked={settings.privacy.onlineStatus}
                  onCheckedChange={(checked) => updateSetting('privacy', 'onlineStatus', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="read-receipts">Accusés de lecture</Label>
                <Switch
                  id="read-receipts"
                  checked={settings.privacy.readReceipts}
                  onCheckedChange={(checked) => updateSetting('privacy', 'readReceipts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="typing-indicator">Indicateur de frappe</Label>
                <Switch
                  id="typing-indicator"
                  checked={settings.privacy.typing}
                  onCheckedChange={(checked) => updateSetting('privacy', 'typing', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="profile-visibility">Visibilité du profil</Label>
                <Select 
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="contacts">Contacts uniquement</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="theme">Thème</Label>
                <Select 
                  value={settings.preferences.theme}
                  onValueChange={(value) => updateSetting('preferences', 'theme', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="language">Langue</Label>
                <Select 
                  value={settings.preferences.language}
                  onValueChange={(value) => updateSetting('preferences', 'language', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select 
                  value={settings.preferences.timezone}
                  onValueChange={(value) => updateSetting('preferences', 'timezone', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Libreville">Libreville (GMT+1)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                    <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="message-preview">Aperçu des messages</Label>
                <Switch
                  id="message-preview"
                  checked={settings.preferences.messagePreview}
                  onCheckedChange={(checked) => updateSetting('preferences', 'messagePreview', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intégrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Intégrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="whatsapp-integration">WhatsApp Business</Label>
                  <p className="text-xs text-muted-foreground">Synchroniser avec WhatsApp</p>
                </div>
                <Switch
                  id="whatsapp-integration"
                  checked={settings.integration.whatsapp}
                  onCheckedChange={(checked) => updateSetting('integration', 'whatsapp', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="telegram-integration">Telegram</Label>
                  <p className="text-xs text-muted-foreground">Bot Telegram intégré</p>
                </div>
                <Switch
                  id="telegram-integration"
                  checked={settings.integration.telegram}
                  onCheckedChange={(checked) => updateSetting('integration', 'telegram', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-integration">Email</Label>
                  <p className="text-xs text-muted-foreground">Notifications par email</p>
                </div>
                <Switch
                  id="email-integration"
                  checked={settings.integration.email}
                  onCheckedChange={(checked) => updateSetting('integration', 'email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-integration">SMS</Label>
                  <p className="text-xs text-muted-foreground">Notifications par SMS</p>
                </div>
                <Switch
                  id="sms-integration"
                  checked={settings.integration.sms}
                  onCheckedChange={(checked) => updateSetting('integration', 'sms', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sauvegarde et Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sauvegarde et Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Exporter les conversations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Sauvegarder les données
              </Button>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Changer le mot de passe
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Authentification 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-6">
        <Button variant="outline">Annuler</Button>
        <Button>Sauvegarder les paramètres</Button>
      </div>
    </div>
  );
};