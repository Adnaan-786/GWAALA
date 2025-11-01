import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Order {
  id: string;
  order_type: string;
  item_name: string;
  quantity: number;
  total_price: number;
  delivery_address: string;
  contact_phone: string;
  status: string;
  created_at: string;
}

export const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <Badge variant="outline">{orders.length} orders</Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No orders yet. Start shopping to see your orders here!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.item_name}</CardTitle>
                    <CardDescription>
                      {order.order_type === "livestock" ? "🐄 Livestock" : "💊 Medicine"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Price</p>
                    <p className="font-medium">₹{order.total_price.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{order.contact_phone}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Ordered {formatDistanceToNow(new Date(order.created_at))} ago
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
