import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface Listing {
  id: string;
  breed: string;
  price: number;
  age_years: number;
  age_months: number;
  weight_kg: number;
  health_status: string;
  vaccination_status: string;
  location: string;
  contact_phone: string;
  image_url: string;
}

export const BuyCattle = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = listings.filter(
        (listing) =>
          listing.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredListings(filtered);
    } else {
      setFilteredListings(listings);
    }
  }, [searchTerm, listings]);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("livestock_listings")
      .select("*")
      .eq("is_sold", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch listings",
        variant: "destructive",
      });
    } else {
      setListings(data || []);
      setFilteredListings(data || []);
    }
  };

  const handlePurchase = async () => {
    if (!selectedListing) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("orders").insert({
        buyer_id: user.id,
        order_type: "livestock",
        item_id: selectedListing.id,
        item_name: selectedListing.breed,
        quantity: 1,
        total_price: selectedListing.price,
        delivery_address: deliveryAddress,
        contact_phone: contactPhone,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase order placed successfully!",
      });
      setShowPurchaseModal(false);
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
            placeholder="Search by breed or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{listing.breed}</CardTitle>
              <CardDescription>₹{listing.price.toLocaleString('en-IN')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Age:</span> {listing.age_years}y {listing.age_months}m
              </p>
              <p className="text-sm">
                <span className="font-semibold">Weight:</span> {listing.weight_kg} kg
              </p>
              <p className="text-sm">
                <span className="font-semibold">Health:</span> {listing.health_status}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Vaccination:</span> {listing.vaccination_status}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Location:</span> {listing.location}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedListing(listing);
                  setShowPurchaseModal(true);
                }}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase {selectedListing?.breed}</DialogTitle>
            <DialogDescription>
              Total: ₹{selectedListing?.price.toLocaleString('en-IN')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
