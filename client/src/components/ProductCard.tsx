import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import SustainabilityBadge from "./SustainabilityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, ShoppingCart } from "lucide-react";
import type { ProductWithSeller } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithSeller;
  showAddToCart?: boolean;
  "data-testid"?: string;
}

export default function ProductCard({ 
  product, 
  showAddToCart = true,
  "data-testid": testId
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: `${product.title} has been added to your cart!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Sign In",
          description: "You need to be signed in to add items to cart.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.available) {
      toast({
        title: "Product Unavailable",
        description: "This product is currently not available.",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0;

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <Card 
      className="product-card overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
      data-testid={testId}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden">
            {product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-testid={`img-product-${product.id}`}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <SustainabilityBadge 
              certified={product.sustainabilityCertified} 
              ecoScore={product.ecoScore}
            />
            {!product.available && (
              <Badge variant="destructive" className="text-xs">
                Sold Out
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                {discountPercentage}% off
              </Badge>
            )}
          </div>

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-2 right-2">
              <Badge className="sustainability-badge text-white text-xs">
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {product.category.replace('-', ' ')}
            </Badge>
            {product.reviews.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                <span data-testid={`text-rating-${product.id}`}>
                  {averageRating.toFixed(1)} ({product.reviews.length})
                </span>
              </div>
            )}
          </div>
          
          {/* Product Title */}
          <h3 
            className="font-semibold text-sm mb-1 line-clamp-2" 
            data-testid={`text-product-title-${product.id}`}
          >
            {product.title}
          </h3>
          
          {/* Seller */}
          <p className="text-xs text-muted-foreground mb-2">
            by {product.seller.firstName} {product.seller.lastName}
          </p>
          
          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div 
                className="text-lg font-bold text-primary" 
                data-testid={`text-price-${product.id}`}
              >
                ${product.price}
              </div>
              {product.originalPrice && (
                <div className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {product.views} views
            </div>
          </div>
          
          {/* Environmental Impact */}
          <div className="bg-muted p-2 rounded text-xs mb-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CO₂ Saved:</span>
              <span 
                className="font-medium text-primary" 
                data-testid={`text-carbon-saved-${product.id}`}
              >
                {product.carbonSaved} kg
              </span>
            </div>
            {product.waterSaved && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Water Saved:</span>
                <span className="font-medium text-accent">
                  {product.waterSaved}L
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground">Eco Score:</span>
              <span className="font-medium text-primary">
                {product.ecoScore}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          {showAddToCart && isAuthenticated && product.available && (
            <Button 
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="w-full"
              size="sm"
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </Button>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
