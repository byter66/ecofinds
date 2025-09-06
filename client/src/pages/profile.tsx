import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import ImpactMetrics from "@/components/ImpactMetrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User, Package, Clock, CheckCircle, Truck, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType, OrderWithItems } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading: loadingOrders } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: userProfile, isLoading: loadingProfile } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
              {userProfile?.profileImageUrl ? (
                <img 
                  src={userProfile.profileImageUrl} 
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-user-name">
                {userProfile?.firstName} {userProfile?.lastName}
              </h1>
              <p className="text-muted-foreground" data-testid="text-user-email">
                {userProfile?.email}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">
                  {userProfile?.userType || 'buyer'}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                    <Package className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Browse Products</h3>
                    <p className="text-sm text-muted-foreground">Find sustainable items</p>
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
                    <User className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sell Items</h3>
                    <p className="text-sm text-muted-foreground">List your products</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Account Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage your profile</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order History</CardTitle>
              <Badge variant="outline" data-testid="badge-orders-count">
                {orders?.length || 0} orders
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Order #{order.id.slice(-8)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                          ${order.totalAmount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                        {order.totalCarbonSaved && (
                          <span className="text-sm text-primary">
                            {parseFloat(order.totalCarbonSaved).toFixed(1)}kg CO₂ saved
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`} data-testid={`button-view-order-${order.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-3 flex items-center space-x-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-xs text-muted-foreground">
                          {item.product.title}
                          {order.items.indexOf(item) < order.items.length - 1 && 
                            order.items.indexOf(item) < 2 && ", "
                          }
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" data-testid="button-view-all-orders">
                      View All Orders
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6" data-testid="text-no-orders">
                  Start shopping for sustainable products to see your orders here.
                </p>
                <Button asChild>
                  <Link href="/marketplace" data-testid="button-start-shopping-profile">
                    Start Shopping
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
