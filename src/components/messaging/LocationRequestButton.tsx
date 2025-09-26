import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { LocationRequestModal } from "@/components/location/LocationRequestModal";

interface LocationRequestButtonProps {
  targetUserId: string;
  conversationId: string;
  targetUserName?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export const LocationRequestButton = ({ 
  targetUserId, 
  conversationId, 
  targetUserName,
  size = "sm",
  variant = "ghost" 
}: LocationRequestButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
      >
        <MapPin className="w-4 h-4 mr-2" />
        Demander position
      </Button>

      <LocationRequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetUserId={targetUserId}
        conversationId={conversationId}
        targetUserName={targetUserName}
      />
    </>
  );
};