import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Search, Star, Zap, CheckCircle, DollarSign } from "lucide-react";

export default function Landing() {
  const { isLoading } = useAuth();

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const scrollToMarketplace = () => {
    document.getElementById('marketplace')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="eco-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">EcoFinds</h1>
                <p className="text-xs text-muted-foreground">Sustainable Marketplace</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input 
                  type="text" 
                  placeholder="Search sustainable products..." 
                  className="w-full pl-10"
                  data-testid="input-search"
                />
                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSignIn}
                data-testid="button-signin"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleSignIn}
                data-testid="button-getstarted"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-sm">
                <span className="sustainability-badge text-white px-3 py-1 rounded-full">
                  ♻️ Carbon Neutral Shipping
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-primary font-medium" data-testid="text-carbon-saved">
                  50M+ kg CO₂ saved
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Shop Sustainably,
                <span className="text-primary">Live Responsibly</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Discover amazing second-hand treasures while reducing your environmental impact. 
                Every purchase helps create a more sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={scrollToMarketplace} 
                  size="lg"
                  data-testid="button-start-shopping"
                >
                  Start Shopping
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSignIn} 
                  size="lg"
                  data-testid="button-become-seller"
                >
                  Become a Seller
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-products-count">2.5M+</div>
                  <div className="text-sm text-muted-foreground">Products Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-customers-count">500K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-satisfaction-rate">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Person holding reusable items and plants in sustainable lifestyle" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating Impact Card */}
              <Card className="absolute -bottom-6 -left-6 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="carbon-savings w-12 h-12 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Your Impact</div>
                      <div className="text-xs text-muted-foreground" data-testid="text-monthly-impact">
                        15kg CO₂ saved this month
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose EcoFinds?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines the best of sustainable shopping with modern technology 
              to create a seamless, eco-friendly marketplace experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="sustainability-badge w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Environmental Impact</h3>
                <p className="text-muted-foreground text-sm">
                  Every purchase shows real-time carbon footprint savings and environmental benefits. 
                  Track your positive impact on the planet.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="bg-accent w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quality Assured</h3>
                <p className="text-muted-foreground text-sm">
                  All products are carefully vetted with detailed condition ratings and 
                  sustainability certifications from trusted sellers.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fair Pricing</h3>
                <p className="text-muted-foreground text-sm">
                  Transparent pricing with no hidden fees. Support local sellers while 
                  getting great deals on sustainable products.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Marketplace Preview */}
      <section id="marketplace" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Discover amazing finds that make a positive impact</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Sample Product Cards */}
            {[
              {
                id: "1",
                title: "Vintage Leather Jacket",
                price: 45,
                originalPrice: 120,
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                carbonSaved: "8.5 kg",
                rating: 4.8,
                reviews: 127
              },
              {
                id: "2",
                title: "Wireless Headphones",
                price: 85,
                originalPrice: 199,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                carbonSaved: "12.3 kg",
                rating: 4.6,
                reviews: 89
              },
              {
                id: "3",
                title: "Plant Starter Kit",
                price: 32,
                originalPrice: 65,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                carbonSaved: "Air Purifier",
                rating: 4.9,
                reviews: 203
              },
              {
                id: "4",
                title: "Classic Literature Set",
                price: 28,
                originalPrice: 84,
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                carbonSaved: "0.8 trees",
                rating: 4.7,
                reviews: 54
              }
            ].map((product) => (
              <Card key={product.id} className="product-card overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="sustainability-badge text-white text-xs px-2 py-1 rounded-full">
                      ♻️ Certified
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {product.rating} ({product.reviews})
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1" data-testid={`text-product-title-${product.id}`}>
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                      ${product.price}
                    </div>
                    <div className="text-xs text-muted-foreground line-through">
                      ${product.originalPrice}
                    </div>
                  </div>
                  
                  <div className="bg-muted p-2 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Impact:</span>
                      <span className="font-medium text-primary" data-testid={`text-product-impact-${product.id}`}>
                        {product.carbonSaved}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              onClick={handleSignIn}
              data-testid="button-view-all-products"
            >
              Sign In to View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="eco-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-primary">EcoFinds</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Building a sustainable future through conscious commerce. Every purchase makes a difference.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Browse Products</a></li>
                <li><a href="#" className="hover:text-foreground">Categories</a></li>
                <li><a href="#" className="hover:text-foreground">Sell Items</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing Guide</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Shipping Info</a></li>
                <li><a href="#" className="hover:text-foreground">Returns</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sustainability</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Our Mission</a></li>
                <li><a href="#" className="hover:text-foreground">Impact Reports</a></li>
                <li><a href="#" className="hover:text-foreground">Carbon Neutral</a></li>
                <li><a href="#" className="hover:text-foreground">Certifications</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 EcoFinds. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
