import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Phone, Star } from "lucide-react";
import { Badge } from "./ui/badge";

interface Veterinarian {
  id: string;
  name: string;
  specialization: string;
  clinic_name: string;
  clinic_address: string;
  phone: string;
  rating: number;
  consultation_fee: number;
  available: boolean;
  experience_years: number;
}

export const Veterinarians = () => {
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [filteredVets, setFilteredVets] = useState<Veterinarian[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchVeterinarians();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vets.filter(
        (vet) =>
          vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vet.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vet.clinic_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVets(filtered);
    } else {
      setFilteredVets(vets);
    }
  }, [searchTerm, vets]);

  const fetchVeterinarians = async () => {
    const { data, error } = await supabase
      .from("veterinarians")
      .select("*")
      .order("rating", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch veterinarians",
        variant: "destructive",
      });
    } else {
      setVets(data || []);
      setFilteredVets(data || []);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialization, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVets.map((vet) => (
          <Card key={vet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Dr. {vet.name}</CardTitle>
                  <CardDescription>{vet.specialization}</CardDescription>
                </div>
                {vet.available && (
                  <Badge variant="default" className="bg-success">
                    Available
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold">{vet.rating}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Clinic:</span> {vet.clinic_name}
                </p>
                <p>
                  <span className="font-semibold">Location:</span> {vet.clinic_address}
                </p>
                <p>
                  <span className="font-semibold">Experience:</span> {vet.experience_years} years
                </p>
                <p>
                  <span className="font-semibold">Consultation Fee:</span> ₹{vet.consultation_fee}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleCall(vet.phone)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button className="flex-1">Book Appointment</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
