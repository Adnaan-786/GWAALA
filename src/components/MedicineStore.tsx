import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, ShieldAlert } from "lucide-react";
import { Badge } from "./ui/badge";

interface Medicine {
  id: string;
  name: string;
  type: string;
  price: number;
  stock_quantity: number;
  prescription_required: boolean;
  description: string;
  manufacturer: string;
}

export const MedicineStore = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = medicines.filter(
        (med) =>
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medicines",
        variant: "destructive",
      });
    } else {
      setMedicines(data || []);
      setFilteredMedicines(data || []);
    }
  };

  const handlePurchase = async () => {
    if (!selectedMedicine) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("orders").insert({
        buyer_id: user.id,
        order_type: "medicine",
        item_id: selectedMedicine.id,
        item_name: selectedMedicine.name,
        quantity,
        total_price: selectedMedicine.price * quantity,
        delivery_address: deliveryAddress,
        contact_phone: contactPhone,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medicine order placed successfully!",
      });
      setShowPurchaseModal(false);
      setQuantity(1);
      setDeliveryAddress("");
      setContactPhone("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => (
          <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{medicine.name}</CardTitle>
                {medicine.prescription_required && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Rx
                  </Badge>
                )}
              </div>
              <CardDescription>₹{medicine.price}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Type:</span> {medicine.type}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Stock:</span> {medicine.stock_quantity} units
              </p>
              <p className="text-sm">
                <span className="font-semibold">Manufacturer:</span> {medicine.manufacturer}
              </p>
              <p className="text-sm text-muted-foreground">{medicine.description}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedMedicine(medicine);
                  setShowPurchaseModal(true);
                }}
                disabled={medicine.stock_quantity === 0}
              >
                {medicine.stock_quantity === 0 ? "Out of Stock" : "Purchase"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase {selectedMedicine?.name}</DialogTitle>
            <DialogDescription>
              Price per unit: ₹{selectedMedicine?.price}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedMedicine?.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Total: ₹{((selectedMedicine?.price || 0) * quantity).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Input
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter delivery address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter contact number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={loading || !deliveryAddress || !contactPhone}>
              {loading ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
