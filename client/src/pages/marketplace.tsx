import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import type { ProductWithSeller } from "@shared/schema";

const categories = [
  { value: "", label: "All Categories" },
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

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "eco-score", label: "Best Eco Score" },
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data: products, isLoading, refetch } = useQuery<ProductWithSeller[]>({
    queryKey: ["/api/products", { 
      search: search || undefined, 
      category: category || undefined,
      limit,
      offset 
    }],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    refetch();
  };

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sustainable Marketplace</h1>
          <p className="text-muted-foreground">
            Discover amazing second-hand products that make a positive environmental impact
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 border border-border">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for sustainable products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-products"
                  />
                  <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="md:w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="md:w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button type="submit" data-testid="button-search">
                <Filter className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground" data-testid="text-results-count">
                {products?.length || 0} products found
                {search && ` for "${search}"`}
                {category && ` in ${categories.find(c => c.value === category)?.label}`}
              </p>
            </div>

            {/* Products Grid */}
            {products && products.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    data-testid={`card-product-${product.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6" data-testid="text-no-products">
                  Try adjusting your search criteria or browse all categories.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setOffset(0);
                    refetch();
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Load More */}
            {products && products.length >= limit && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  data-testid="button-load-more"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
