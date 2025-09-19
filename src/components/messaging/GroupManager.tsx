import { useState } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Settings, 
  UserPlus, 
  Crown, 
  Shield, 
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Share
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  memberCount: number;
  isPrivate: boolean;
  role: "owner" | "admin" | "member";
  lastActivity: string;
  unreadCount: number;
  category: "business" | "customers" | "suppliers" | "support";
}

interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "member";
  isOnline: boolean;
  lastSeen: string;
}

const MOCK_GROUPS: Group[] = [
  {
    id: "1",
    name: "Équipe Commerciale",
    description: "Discussion pour l'équipe commerciale ConsoGab",
    memberCount: 12,
    isPrivate: true,
    role: "owner",
    lastActivity: "Il y a 5 minutes",
    unreadCount: 3,
    category: "business"
  },
  {
    id: "2",
    name: "Clients Premium",
    description: "Groupe exclusif pour nos clients premium",
    memberCount: 45,
    isPrivate: true,
    role: "admin",
    lastActivity: "Il y a 1 heure",
    unreadCount: 0,
    category: "customers"
  },
  {
    id: "3",
    name: "Fournisseurs Partenaires",
    description: "Communication avec nos fournisseurs principaux",
    memberCount: 8,
    isPrivate: false,
    role: "member",
    lastActivity: "Il y a 3 heures",
    unreadCount: 2,
    category: "suppliers"
  },
  {
    id: "4",
    name: "Support Client",
    description: "Équipe de support client 24/7",
    memberCount: 6,
    isPrivate: true,
    role: "admin",
    lastActivity: "Il y a 10 minutes",
    unreadCount: 1,
    category: "support"
  }
];

const MOCK_MEMBERS: Record<string, Member[]> = {
  "1": [
    {
      id: "1",
      name: "Jean Mbengue",
      role: "owner",
      isOnline: true,
      lastSeen: "En ligne"
    },
    {
      id: "2",
      name: "Marie Ndong",
      role: "admin",
      isOnline: true,
      lastSeen: "En ligne"
    },
    {
      id: "3",
      name: "Paul Ondo",
      role: "member",
      isOnline: false,
      lastSeen: "Il y a 2h"
    }
  ]
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "owner":
      return <Crown className="w-3 h-3 text-yellow-500" />;
    case "admin":
      return <Shield className="w-3 h-3 text-blue-500" />;
    default:
      return null;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "business":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "customers":
      return "bg-green-100 text-green-700 border-green-200";
    case "suppliers":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "support":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

interface GroupManagerProps {
  searchQuery: string;
}

export const GroupManager = ({ searchQuery }: GroupManagerProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>("1");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isPrivate: true,
    category: "business"
  });

  const filteredGroups = MOCK_GROUPS.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGroupData = MOCK_GROUPS.find(g => g.id === selectedGroup);
  const groupMembers = selectedGroup ? MOCK_MEMBERS[selectedGroup] || [] : [];

  const handleCreateGroup = () => {
    console.log("Creating group:", newGroup);
    setShowCreateDialog(false);
    setNewGroup({ name: "", description: "", isPrivate: true, category: "business" });
  };

  return (
    <div className="flex h-full">
      {/* Groups List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col bg-background/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Mes Groupes</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-white">
                  <Plus className="w-4 h-4" />
                  Créer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau groupe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du groupe</Label>
                    <Input
                      id="name"
                      placeholder="Nom du groupe..."
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Description du groupe..."
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={newGroup.category} onValueChange={(value) => setNewGroup({...newGroup, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Équipe</SelectItem>
                        <SelectItem value="customers">Clients</SelectItem>
                        <SelectItem value="suppliers">Fournisseurs</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private"
                      checked={newGroup.isPrivate}
                      onCheckedChange={(checked) => setNewGroup({...newGroup, isPrivate: checked})}
                    />
                    <Label htmlFor="private">Groupe privé</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateGroup} className="flex-1">
                      Créer le groupe
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Groups */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredGroups.map((group) => (
              <Card
                key={group.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-0",
                  selectedGroup === group.id 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-md" 
                    : "hover:bg-accent/5"
                )}
                onClick={() => setSelectedGroup(group.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                          <Users className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Role indicator */}
                      <div className="absolute -top-1 -right-1">
                        {getRoleIcon(group.role)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate flex items-center gap-1">
                          {group.name}
                          {group.isPrivate && (
                            <Badge variant="outline" className="text-xs px-1 py-0">Privé</Badge>
                          )}
                        </h4>
                        {group.unreadCount > 0 && (
                          <Badge className="bg-primary text-white text-xs px-2 py-0 h-5">
                            {group.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {group.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs px-2 py-0 h-5", getCategoryColor(group.category))}>
                            {group.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {group.memberCount} membres
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {group.lastActivity}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Group Details */}
      <div className="flex-1 flex flex-col">
        {selectedGroupData ? (
          <>
            {/* Group Header */}
            <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedGroupData.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      <Users className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{selectedGroupData.name}</h3>
                      {getRoleIcon(selectedGroupData.role)}
                      {selectedGroupData.isPrivate && (
                        <Badge variant="outline" className="text-xs">Privé</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedGroupData.memberCount} membres • {selectedGroupData.lastActivity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Group Description */}
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{selectedGroupData.description}</p>
              </div>
            </div>

            {/* Group Content */}
            <div className="flex-1 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Members List */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Membres ({groupMembers.length})</CardTitle>
                        <Button size="sm" className="gap-2">
                          <UserPlus className="w-4 h-4" />
                          Ajouter
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groupMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 hover:bg-accent/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback className="text-sm">
                                    {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                {member.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                )}
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{member.name}</span>
                                  {getRoleIcon(member.role)}
                                </div>
                                <span className="text-xs text-muted-foreground">{member.lastSeen}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {member.role}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Group Actions & Info */}
                <div className="space-y-4">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <UserPlus className="w-4 h-4" />
                        Inviter des membres
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Share className="w-4 h-4" />
                        Partager le groupe
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Copy className="w-4 h-4" />
                        Copier le lien
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Edit className="w-4 h-4" />
                        Modifier le groupe
                      </Button>
                      {selectedGroupData.role === "owner" && (
                        <Button className="w-full justify-start gap-2 text-red-600 hover:text-red-700" variant="outline">
                          <Trash2 className="w-4 h-4" />
                          Supprimer le groupe
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Group Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Messages aujourd'hui</span>
                        <span className="font-medium">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Membres actifs</span>
                        <span className="font-medium">8/12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Créé le</span>
                        <span className="font-medium">15 Jan 2024</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Users className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Sélectionnez un groupe</h3>
                <p className="text-muted-foreground">
                  Choisissez un groupe pour voir les détails et gérer les membres
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};