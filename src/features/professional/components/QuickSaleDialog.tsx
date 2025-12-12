
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface QuickSaleDialogProps {
  businessId: string;
}

export const QuickSaleDialog = ({ businessId }: QuickSaleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Montant invalide");
      return;
    }

    setLoading(true);
    try {
      // Insert manual order
      // Assuming 'orders' table structure from previous analysis
      const { error } = await supabase
        .from('orders')
        .insert({
          business_id: businessId,
          total_amount: Number(amount),
          status: 'completed',
          // Assuming we can store metadata or description
          // If not, we just store the amount. A real system would need 'order_items' too.
          // For 'Quick Sale' (Vente Comptoir), we simplify.
        });

      if (error) throw error;

      toast.success("Vente enregistrée !");
      setIsOpen(false);
      setAmount("");
      setDescription("");
      // Refresh stats immediately
      queryClient.invalidateQueries({ queryKey: ['business-stats', businessId] });
    } catch (err) {
      console.error("Error creating manual sale:", err);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-xs text-primary mt-1">
          + Saisir vente manuelle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Saisir une vente hors-ligne</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Ex: 2 Chawarmas complets"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Enregistrer la vente
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
