import { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  Circle, 
  Users, 
  MessageCircle,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const RealTimeIndicators = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeUsers, setActiveUsers] = useState(12);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageQueue, setMessageQueue] = useState(0);

  // Simulate real-time status
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate typing users
      const mockTypingUsers = Math.random() > 0.7 ? ["Alice", "Bob"] : [];
      setTypingUsers(mockTypingUsers);
      
      // Simulate active users fluctuation
      setActiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      
      // Simulate message queue
      setMessageQueue(prev => Math.max(0, prev + (Math.random() > 0.8 ? 1 : -1)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <Circle 
          className={cn(
            "w-2 h-2 animate-pulse",
            isOnline ? "text-green-500 fill-green-500" : "text-red-500 fill-red-500"
          )} 
        />
      </div>

      {/* Active Users */}
      {activeUsers > 0 && (
        <Badge variant="outline" className="gap-1 px-2 py-1 text-xs">
          <Users className="w-3 h-3" />
          {activeUsers}
        </Badge>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <Badge className="gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 animate-pulse">
          <MessageCircle className="w-3 h-3" />
          {typingUsers.length} en train d'écrire...
        </Badge>
      )}

      {/* Message Queue */}
      {messageQueue > 0 && (
        <Badge className="gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700">
          <Zap className="w-3 h-3" />
          {messageQueue}
        </Badge>
      )}
    </div>
  );
};