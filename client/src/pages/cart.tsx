import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { CartItemWithProduct } from "@shared/schema";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    if (newQuantity !== currentQuantity) {
      updateQuantityMutation.mutate({ id, quantity: newQuantity });
    }
  };

  const removeItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your cart.
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems?.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  ) || 0;

  const totalCarbonSaved = cartItems?.reduce((sum, item) => 
    sum + (parseFloat(item.product.carbonSaved) * item.quantity), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-cart-title">
          Shopping Cart
        </h1>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6" data-testid="text-empty-cart">
              Start shopping for sustainable products to fill your cart!
            </p>
            <Button asChild>
              <Link href="/marketplace" data-testid="button-start-shopping">
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 overflow-hidden rounded-lg border border-border">
                        {item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                            data-testid={`img-cart-item-${item.id}`}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors" data-testid={`text-cart-item-title-${item.id}`}>
                            {item.product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          by {item.product.seller.firstName} {item.product.seller.lastName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-bold text-primary" data-testid={`text-cart-item-price-${item.id}`}>
                            ${item.product.price}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.product.carbonSaved}kg CO₂ saved each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          data-testid={`button-decrease-quantity-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <Input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => {
                            const quantity = Math.max(1, parseInt(e.target.value) || 1);
                            updateQuantityMutation.mutate({ id: item.id, quantity });
                          }}
                          className="w-16 text-center"
                          min="1"
                          data-testid={`input-quantity-${item.id}`}
                        />
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity, 1)}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`button-increase-quantity-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items ({cartItems.length})</span>
                      <span data-testid="text-items-count">{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span data-testid="text-subtotal">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-primary">Free</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span data-testid="text-total">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Environmental Impact */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-primary">Your Environmental Impact</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>CO₂ Saved:</span>
                        <span className="font-medium text-primary" data-testid="text-cart-carbon-saved">
                          {totalCarbonSaved.toFixed(1)} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trees Equivalent:</span>
                        <span className="font-medium text-accent">
                          {(totalCarbonSaved / 22).toFixed(1)} trees
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    asChild
                    data-testid="button-proceed-checkout"
                  >
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                    data-testid="button-continue-shopping"
                  >
                    <Link href="/marketplace">
                      Continue Shopping
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
