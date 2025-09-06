import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Search, ShoppingCart, User, Menu } from "lucide-react";
import type { CartItemWithProduct } from "@shared/schema";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartItems } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const cartItemsCount = cartItems?.length || 0;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="eco-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">EcoFinds</h1>
                <p className="text-xs text-muted-foreground">Sustainable Marketplace</p>
              </div>
            </div>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input 
                type="text" 
                placeholder="Search sustainable products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
                data-testid="input-header-search"
              />
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-3">
                  <Button variant="ghost" asChild>
                    <Link href="/marketplace" data-testid="link-marketplace">
                      Browse
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/sell" data-testid="link-sell">
                      Sell
                    </Link>
                  </Button>
                </div>

                {/* Cart */}
                <Button variant="ghost" size="sm" className="relative" asChild>
                  <Link href="/cart" data-testid="link-cart">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemsCount > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
                        data-testid="badge-cart-count"
                      >
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid="button-user-menu">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" data-testid="link-profile">
                        Profile & Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sell" data-testid="link-sell-dropdown">
                        Sell Items
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} data-testid="button-signout">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/marketplace" data-testid="link-marketplace-mobile">
                          Browse Products
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/sell" data-testid="link-sell-mobile">
                          Sell Items
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" data-testid="link-profile-mobile">
                          Profile & Orders
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              /* Auth Buttons for non-authenticated users */
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-signin-header"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-getstarted-header"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isAuthenticated && (
          <div className="md:hidden mt-4">
            <form onSubmit={handleSearch} className="relative">
              <Input 
                type="text" 
                placeholder="Search sustainable products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
                data-testid="input-mobile-search"
              />
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5" />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
