import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ImpactMetrics from "@/components/ImpactMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ShoppingBag, Heart } from "lucide-react";
import { Link } from "wouter";
import type { ProductWithSeller } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();

  const { data: featuredProducts, isLoading: loadingProducts } = useQuery<ProductWithSeller[]>({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
  });

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
  });

  if (loadingProducts) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
            Welcome back, {user?.firstName || 'Eco Warrior'}! 🌱
          </h1>
          <p className="text-muted-foreground">
            Continue your sustainable shopping journey and make a positive impact on the planet.
          </p>
        </div>

        {/* Impact Metrics */}
        <ImpactMetrics />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/marketplace">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Browse Marketplace</h3>
                    <p className="text-sm text-muted-foreground">Discover sustainable products</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/sell">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-accent w-12 h-12 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sell Your Items</h3>
                    <p className="text-sm text-muted-foreground">Turn clutter into cash</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/cart">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Cart</h3>
                    <p className="text-sm text-muted-foreground">
                      {cartItems?.length || 0} items waiting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Featured Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Featured Products</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/marketplace" data-testid="button-view-all">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  data-testid={`card-featured-product-${product.id}`}
                />
              ))}
            </div>
            
            {!featuredProducts?.length && (
              <div className="text-center py-12">
                <p className="text-muted-foreground" data-testid="text-no-featured-products">
                  No featured products available at the moment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
