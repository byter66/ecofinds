import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Droplets, TreePine, Zap } from "lucide-react";
import type { User, OrderWithItems } from "@shared/schema";

export default function ImpactMetrics() {
  const { user } = useAuth();

  const { data: orders, isLoading: loadingOrders } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const { data: userProfile, isLoading: loadingProfile } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  if (loadingOrders || loadingProfile) {
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Calculate impact metrics from orders
  const totalCarbonSaved = orders?.reduce((sum, order) => 
    sum + (parseFloat(order.totalCarbonSaved || "0")), 0
  ) || 0;

  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((sum, order) => 
    sum + parseFloat(order.totalAmount), 0
  ) || 0;

  // Calculate equivalent metrics
  const treesEquivalent = totalCarbonSaved / 22; // 1 tree absorbs ~22kg CO2 per year
  const waterSaved = totalCarbonSaved * 50; // Approximate water savings
  const energySaved = totalCarbonSaved * 2.3; // Approximate energy savings in kWh

  const metrics = [
    {
      title: "CO₂ Saved",
      value: `${totalCarbonSaved.toFixed(1)} kg`,
      description: "Carbon emissions prevented",
      icon: Leaf,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "metric-carbon-saved"
    },
    {
      title: "Water Saved",
      value: `${waterSaved.toFixed(0)} L`,
      description: "Fresh water conserved",
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      testId: "metric-water-saved"
    },
    {
      title: "Trees Equivalent",
      value: `${treesEquivalent.toFixed(1)}`,
      description: "Trees worth of CO₂ absorption",
      icon: TreePine,
      color: "text-accent",
      bgColor: "bg-accent/10",
      testId: "metric-trees-equivalent"
    },
    {
      title: "Energy Saved",
      value: `${energySaved.toFixed(1)} kWh`,
      description: "Energy consumption reduced",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      testId: "metric-energy-saved"
    }
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Environmental Impact</h2>
        <p className="text-muted-foreground">
          See the positive impact you've made through sustainable shopping
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`${metric.bgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className="flex-1">
                    <div 
                      className={`text-2xl font-bold ${metric.color}`}
                      data-testid={metric.testId}
                    >
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shopping Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-total-orders">
                {totalOrders}
              </div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-total-spent">
                ${totalSpent.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-member-since">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Member Since</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
