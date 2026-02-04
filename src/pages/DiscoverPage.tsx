import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Grid3X3, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import ProductCard from '@/components/product/ProductCard';
import FilterSheet, { FilterState } from '@/components/filters/FilterSheet';
import { products, categories, getShopById, shops } from '@/data/mockData';
import { cn } from '@/lib/utils';

const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get max price for filter
  const maxPrice = useMemo(() => {
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100;
  }, []);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const categoryFromUrl = searchParams.get('category');
    return {
      categories: categoryFromUrl ? [categoryFromUrl] : [],
      colors: [],
      sizes: [],
      priceRange: [0, maxPrice],
    };
  });

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.categories.length === 1) params.set('category', filters.categories[0]);
    setSearchParams(params, { replace: true });
  }, [searchQuery, filters.categories, setSearchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const shop = getShopById(product.shopId);
      
      // Search filter - match product name, category, or shop name
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (shop?.name.toLowerCase().includes(searchLower) ?? false);
      
      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(product.category);
      
      // Color filter - check if product has matching color variant
      const matchesColor = filters.colors.length === 0 || 
        (product.variants?.some(v => 
          v.type === 'color' && v.options.some(opt => filters.colors.includes(opt))
        ) ?? false);
      
      // Size filter - check if product has matching size variant
      const matchesSize = filters.sizes.length === 0 || 
        (product.variants?.some(v => 
          v.type === 'size' && v.options.some(opt => filters.sizes.includes(opt))
        ) ?? false);
      
      // Price filter
      const matchesPrice = product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1];
      
      return matchesSearch && matchesCategory && matchesColor && matchesSize && matchesPrice;
    });
  }, [searchQuery, filters]);

  const handleCategoryClick = (categoryName: string | null) => {
    setFilters(prev => ({
      ...prev,
      categories: categoryName ? [categoryName] : [],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold md:text-4xl"
          >
            Discover
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-muted-foreground"
          >
            Explore thousands of unique products from independent sellers
          </motion.p>
        </div>

        {/* Search & Filters Row */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, categories, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
          <FilterSheet 
            filters={filters} 
            onFiltersChange={setFilters}
            maxPrice={maxPrice}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-6">
          <Button
            variant={filters.categories.length === 0 ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryClick(null)}
            className={cn(
              "rounded-full flex-shrink-0",
              filters.categories.length === 0 && "bg-gradient-primary"
            )}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={filters.categories.includes(category.name) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(category.name)}
              className={cn(
                "rounded-full flex-shrink-0",
                filters.categories.includes(category.name) && "bg-gradient-primary"
              )}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Active Filters Display */}
        {(filters.colors.length > 0 || filters.sizes.length > 0 || 
          filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.colors.map(color => (
              <span key={color} className="px-2 py-1 text-xs rounded-full bg-accent">
                {color}
              </span>
            ))}
            {filters.sizes.map(size => (
              <span key={size} className="px-2 py-1 text-xs rounded-full bg-accent">
                Size: {size}
              </span>
            ))}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
              <span className="px-2 py-1 text-xs rounded-full bg-accent">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </span>
            )}
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 && 's'}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && 'bg-secondary')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'bg-secondary')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => { 
              setSearchQuery(''); 
              setFilters({
                categories: [],
                colors: [],
                sizes: [],
                priceRange: [0, maxPrice],
              }); 
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid'
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2"
          )}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                shop={getShopById(product.shopId)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
