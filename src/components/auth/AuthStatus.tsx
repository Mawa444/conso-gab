import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, LogOut } from "lucide-react";

interface AuthStatusProps {
  onLogin: () => void;
}

export const AuthStatus = ({ onLogin }: AuthStatusProps) => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onLogin}
        className="text-xs"
      >
        <User className="w-3 h-3 mr-1" />
        Connexion
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="secondary" className="text-xs">
        <User className="w-3 h-3 mr-1" />
        {user.user_metadata?.full_name || user.email}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="text-xs p-1"
      >
        <LogOut className="w-3 h-3" />
      </Button>
    </div>
  );
};