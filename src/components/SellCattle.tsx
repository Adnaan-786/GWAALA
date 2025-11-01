import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";

export const SellCattle = () => {
  const [userAnimals, setUserAnimals] = useState<any[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [price, setPrice] = useState("");
  const [healthStatus, setHealthStatus] = useState("Excellent");
  const [vaccinationStatus, setVaccinationStatus] = useState("Up to date");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserAnimals();
  }, []);

  const fetchUserAnimals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("animal_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUserAnimals(data);
    }
  };

  const handleListForSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const animal = userAnimals.find(a => a.id === selectedAnimal);
      if (!animal) throw new Error("Animal not found");

      const { error } = await supabase.from("livestock_listings").insert({
        seller_id: user.id,
        animal_id: animal.animal_id,
        breed: animal.animal_type,
        price: parseFloat(price),
        weight_kg: animal.body_length,
        health_status: healthStatus,
        vaccination_status: vaccinationStatus,
        location: "India", // You can make this dynamic
        contact_phone: contactPhone,
        image_url: animal.image_url,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Animal listed for sale successfully!",
      });
      
      setSelectedAnimal("");
      setPrice("");
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>List Your Animal for Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleListForSale} className="space-y-4">
            <div>
              <Label htmlFor="animal">Select Animal</Label>
              <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose from your registered animals" />
                </SelectTrigger>
                <SelectContent>
                  {userAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.animal_id} - {animal.animal_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter selling price"
                required
              />
            </div>

            <div>
              <Label htmlFor="health">Health Status</Label>
              <Select value={healthStatus} onValueChange={setHealthStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vaccination">Vaccination Status</Label>
              <Select value={vaccinationStatus} onValueChange={setVaccinationStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Up to date">Up to date</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Not vaccinated">Not vaccinated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact">Contact Phone</Label>
              <Input
                id="contact"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter contact number"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !selectedAnimal}>
              {loading ? "Listing..." : "List for Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
