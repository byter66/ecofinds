import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { Upload, Plus, X, Package, FaRupeeSign, Leaf } from "lucide-react";
import { z } from "zod";

const sellFormSchema = insertProductSchema.extend({
  images: z.array(z.string()).min(1, "At least one image is required"),
});

type SellFormData = z.infer<typeof sellFormSchema>;

const categories = [
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "home-garden", label: "Home & Garden" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports" },
  { value: "toys", label: "Toys" },
  { value: "furniture", label: "Furniture" },
  { value: "jewelry", label: "Jewelry" },
  { value: "vehicles", label: "Vehicles" },
  { value: "other", label: "Other" },
];

const conditions = [
  { value: "excellent", label: "Excellent" },
  { value: "very-good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const ecoScores = [
  { value: "A+", label: "A+ (Excellent)" },
  { value: "A", label: "A (Very Good)" },
  { value: "B+", label: "B+ (Good)" },
  { value: "B", label: "B (Fair)" },
  { value: "C+", label: "C+ (Below Average)" },
  { value: "C", label: "C (Poor)" },
];

export default function Sell() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "other",
      condition: "good",
      conditionRating: 8,
      images: [],
      carbonSaved: "",
      waterSaved: "",
      ecoScore: "B+",
      sustainabilityCertified: false,
      available: true,
      featured: false,
    },
  });

  const { data: myProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["/api/my-products"],
    enabled: isAuthenticated,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: SellFormData) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Listed Successfully!",
        description: "Your product has been added to the marketplace.",
      });
      form.reset();
      setImageUrls([]);
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
        title: "Failed to List Product",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      const updatedUrls = [...imageUrls, newImageUrl.trim()];
      setImageUrls(updatedUrls);
      form.setValue("images", updatedUrls);
      setNewImageUrl("");
    }
  };

  const removeImageUrl = (url: string) => {
    const updatedUrls = imageUrls.filter((u) => u !== url);
    setImageUrls(updatedUrls);
    form.setValue("images", updatedUrls);
  };

  const onSubmit = (data: SellFormData) => {
    if (imageUrls.length === 0) {
      toast({
        title: "Images Required",
        description: "Please add at least one image of your product.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...data,
      images: imageUrls,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to sell your products on EcoFinds.
            </p>
            <Button onClick={() => (window.location.href = "/api/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sell Your Items</h1>
          <p className="text-muted-foreground">
            Turn your unused items into cash while helping the environment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Listing Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Create New Listing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Basic Information
                      </h3>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Title *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Vintage Leather Jacket"
                                {...field}
                                data-testid="input-product-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your product's condition, features, and why it's sustainable..."
                                className="min-h-24"
                                {...field}
                                data-testid="textarea-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-product-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem
                                      key={cat.value}
                                      value={cat.value}
                                    >
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="condition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Condition *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-product-condition">
                                    <SelectValue placeholder="Select condition" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {conditions.map((condition) => (
                                    <SelectItem
                                      key={condition.value}
                                      value={condition.value}
                                    >
                                      {condition.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="conditionRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition Rating (1-10) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                placeholder="8"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                data-testid="input-condition-rating"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <FaRupeeSign className="w-5 h-5 mr-2" />
                        Pricing
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selling Price ($) *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="45.00"
                                  {...field}
                                  data-testid="input-selling-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="originalPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Original Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="120.00"
                                  {...field}
                                  data-testid="input-original-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Sustainability */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Leaf className="w-5 h-5 mr-2" />
                        Sustainability Impact
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="carbonSaved"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CO₂ Saved (kg) *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="8.5"
                                  {...field}
                                  data-testid="input-carbon-saved"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="waterSaved"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Water Saved (L)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="2500"
                                  {...field}
                                  data-testid="input-water-saved"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="ecoScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eco Score *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-eco-score">
                                  <SelectValue placeholder="Select eco score" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ecoScores.map((score) => (
                                  <SelectItem
                                    key={score.value}
                                    value={score.value}
                                  >
                                    {score.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sustainabilityCertified"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Sustainability Certified
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Does this product have official sustainability
                                certifications?
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-sustainability-certified"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Product Images</h3>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter image URL"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            data-testid="input-image-url"
                          />
                          <Button
                            type="button"
                            onClick={addImageUrl}
                            disabled={!newImageUrl.trim()}
                            data-testid="button-add-image"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border border-border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImageUrl(url)}
                                  data-testid={`button-remove-image-${index}`}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={createProductMutation.isPending}
                      data-testid="button-list-product"
                    >
                      {createProductMutation.isPending
                        ? "Listing Product..."
                        : "List Product"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Tips & My Listings */}
          <div className="space-y-6">
            {/* Selling Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Selling Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Take Quality Photos:</strong> Use natural lighting and
                  show multiple angles
                </div>
                <div>
                  <strong>Be Honest:</strong> Accurately describe condition and
                  any flaws
                </div>
                <div>
                  <strong>Price Competitively:</strong> Research similar items
                  for fair pricing
                </div>
                <div>
                  <strong>Highlight Sustainability:</strong> Mention
                  eco-friendly materials or certifications
                </div>
                <div>
                  <strong>Respond Quickly:</strong> Answer buyer questions
                  promptly to build trust
                </div>
              </CardContent>
            </Card>

            {/* My Recent Listings */}
            <Card>
              <CardHeader>
                <CardTitle>My Recent Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : myProducts && myProducts.length > 0 ? (
                  <div className="space-y-3">
                    {myProducts.slice(0, 3).map((product: any) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-3 p-2 border border-border rounded"
                      >
                        <div className="w-12 h-12 bg-muted rounded" />
                        <div className="flex-1">
                          <div
                            className="font-medium text-sm line-clamp-1"
                            data-testid={`text-my-product-${product.id}`}
                          >
                            {product.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="text-no-listings"
                    >
                      No listings yet. Create your first listing above!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
