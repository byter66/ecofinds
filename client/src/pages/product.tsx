import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import SustainabilityBadge from "@/components/SustainabilityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Heart, ShoppingCart, User, Truck, RotateCcw } from "lucide-react";
import type { ProductWithSeller } from "@shared/schema";

export default function Product() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<ProductWithSeller>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart!",
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

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to view product details.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product.available) {
      toast({
        title: "Product Unavailable",
        description: "This product is currently not available.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(product.id);
  };

  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border border-border">
              {product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  data-testid="img-product-main"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded border border-border cursor-pointer">
                    <img 
                      src={image} 
                      alt={`${product.title} ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      data-testid={`img-product-thumbnail-${index}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <SustainabilityBadge 
                  certified={product.sustainabilityCertified} 
                  ecoScore={product.ecoScore}
                />
                <Badge variant="secondary" data-testid="badge-category">
                  {product.category.replace('-', ' ')}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold mb-2" data-testid="text-product-title">
                {product.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                  <span data-testid="text-rating">
                    {averageRating.toFixed(1)} ({product.reviews.length} reviews)
                  </span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-1" />
                  <span data-testid="text-seller">
                    {product.seller.firstName} {product.seller.lastName}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Price */}
            <div className="border-t border-b border-border py-4">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-primary" data-testid="text-current-price">
                  ${product.price}
                </div>
                {product.originalPrice && (
                  <>
                    <div className="text-lg text-muted-foreground line-through" data-testid="text-original-price">
                      ${product.originalPrice}
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)}% off
                    </Badge>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  <span>Free shipping</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
            
            {/* Condition */}
            <div>
              <h4 className="font-medium mb-2">Condition</h4>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" data-testid="text-condition">
                  {product.condition.replace('-', ' ')} ({product.conditionRating}/10)
                </Badge>
                {!product.available && (
                  <Badge variant="destructive">Sold Out</Badge>
                )}
              </div>
            </div>
            
            {/* Environmental Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Heart className="w-5 h-5 mr-2 text-primary" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">CO₂ Saved</div>
                    <div className="font-medium text-primary" data-testid="text-carbon-saved">
                      {product.carbonSaved} kg
                    </div>
                  </div>
                  {product.waterSaved && (
                    <div>
                      <div className="text-muted-foreground">Water Saved</div>
                      <div className="font-medium text-accent" data-testid="text-water-saved">
                        {product.waterSaved}L
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Eco Score</div>
                    <div className="font-medium text-primary" data-testid="text-eco-score">
                      {product.ecoScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Views</div>
                    <div className="font-medium" data-testid="text-views">
                      {product.views}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart}
                disabled={!product.available || addToCartMutation.isPending}
                className="w-full"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // TODO: Implement messaging system
                  toast({
                    title: "Coming Soon",
                    description: "Direct messaging feature is coming soon!",
                  });
                }}
                data-testid="button-contact-seller"
              >
                Contact Seller
              </Button>
            </div>
            
            {/* Product Description */}
            <div>
              <h4 className="font-medium mb-3">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-description">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex items-center space-x-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-current text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground" data-testid={`text-review-${review.id}`}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
