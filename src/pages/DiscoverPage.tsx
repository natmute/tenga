import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Grid3X3, LayoutList, Loader2, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import FilterSheet, { FilterState } from '@/components/filters/FilterSheet';
import { fetchCategories } from '@/data/categories';
import type { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Shop } from '@/types';
import { cn } from '@/lib/utils';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600?text=Product';
const PLACEHOLDER_LOGO = 'https://placehold.co/200x200?text=Shop';

function mapDbProductToProduct(row: {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  description: string | null;
  in_stock: boolean | null;
  stock_count: number | null;
  rating: number | null;
  review_count: number | null;
  like_count: number | null;
  created_at: string | null;
  product_images?: { image_url: string }[];
  shops?: { name: string; slug: string; logo: string | null; categories?: { name: string } | null } | null;
}): Product {
  const images = row.product_images?.length
    ? row.product_images.map((i) => i.image_url)
    : [PLACEHOLDER_IMAGE];
  const categoryName = row.shops?.categories?.name ?? '';
  return {
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    images,
    description: row.description ?? '',
    category: categoryName,
    inStock: row.in_stock ?? true,
    stockCount: row.stock_count ?? undefined,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    likeCount: row.like_count ?? 0,
    createdAt: row.created_at ?? '',
  };
}

function mapDbRowToShop(row: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  bio: string | null;
  location: string | null;
  categories?: { name: string } | null;
}): Shop {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo ?? PLACEHOLDER_LOGO,
    banner: row.banner ?? 'https://placehold.co/1200x400?text=Shop',
    bio: row.bio ?? '',
    category: row.categories?.name ?? '—',
    rating: 0,
    reviewCount: 0,
    followerCount: 0,
    productCount: 0,
    isVerified: true,
    location: row.location ?? undefined,
  };
}

/* ─── Featured Brands Carousel (Takealot-style) ─── */
function FeaturedBrandsCarousel({
  shops,
  shopFeaturedProducts,
}: {
  shops: Shop[];
  shopFeaturedProducts: Record<string, Product[]>;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Store className="h-5 w-5" />
          Featured Brands
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex gap-4">
          {shops.map((shop) => {
            const featured = shopFeaturedProducts[shop.id] ?? [];
            return (
              <Link
                key={shop.id}
                to={`/shop/${shop.slug}`}
                className="min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-[48%] lg:basis-[32%] group"
              >
                <div className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-lg">
                  {/* Banner + Logo overlay */}
                  <div className="relative h-28 sm:h-32 overflow-hidden">
                    <img
                      src={shop.banner}
                      alt={shop.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover bg-white"
                      />
                      <div>
                        <p className="text-white font-semibold text-sm leading-tight drop-shadow">
                          {shop.name}
                        </p>
                        <p className="text-white/80 text-xs drop-shadow">
                          {shop.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Featured Products Row */}
                  <div className="p-3">
                    {featured.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {featured.map((product) => (
                          <div
                            key={product.id}
                            className="aspect-square rounded-lg overflow-hidden bg-secondary"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {/* Fill empty slots so the grid stays uniform */}
                        {Array.from({ length: 3 - featured.length }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className="aspect-square rounded-lg bg-secondary"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
                        No products yet
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {shop.productCount} product{shop.productCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qFromUrl = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [discoverShops, setDiscoverShops] = useState<Shop[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [featuredShopProducts, setFeaturedShopProducts] = useState<Record<string, Product[]>>({});
  const [realShopsMap, setRealShopsMap] = useState<Record<string, Shop>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const categoryFromUrl = searchParams.get('category');

  // Sync search and category from URL (e.g. when navigating from header or browser back)
  useEffect(() => {
    setSearchQuery(qFromUrl);
  }, [qFromUrl]);

  // Sync category from URL when it has a category param (e.g. deep link or back button)
  useEffect(() => {
    if (categoryFromUrl) {
      setFilters((prev) => ({
        ...prev,
        categories: [categoryFromUrl],
      }));
    }
  }, [categoryFromUrl]);

  // Fetch products that appear on Discover: use RPC for which shops are on discover (single source of truth)
  useEffect(() => {
    (async () => {
      const { data: discoverShopIds } = await supabase.rpc('get_discover_shop_ids');
      const idsOnDiscover = new Set<string>((discoverShopIds ?? []) as string[]);

      const { data: shopRows } = await supabase
        .from('shops')
        .select('id, name, slug, logo, banner, bio, location, categories(name), is_on_discover, is_featured')
        .eq('is_verified', true);
      if (!shopRows?.length) {
        setProducts([]);
        setDiscoverShops([]);
        setRealShopsMap({});
        setFeaturedShops([]);
        setFeaturedShopProducts({});
        setProductsLoading(false);
        return;
      }
      const shopIds = shopRows.map((s) => s.id);
      const shopMap: Record<string, Shop> = {};
      const shopsForDiscover: Shop[] = [];
      const featuredShopsList: Shop[] = [];
      shopRows.forEach((r) => {
        const shop = mapDbRowToShop(r);
        shopMap[r.id] = shop;
        if (idsOnDiscover.has(r.id)) shopsForDiscover.push(shop);
        if ((r as { is_featured?: boolean }).is_featured === true) featuredShopsList.push(shop);
      });
      setRealShopsMap(shopMap);
      setFeaturedShops(featuredShopsList);
      const { data: productRows } = await supabase
        .from('products')
        .select('*, product_images(image_url), shops(name, slug, logo, categories(name))')
        .in('shop_id', shopIds);
      const rows = (productRows ?? []).filter((row: { shop_id: string; is_on_discover?: boolean }) => {
        const shopInDiscover = idsOnDiscover.has(row.shop_id);
        const productInDiscover = row.is_on_discover === true;
        return shopInDiscover || productInDiscover;
      });
      const productCountByShopId: Record<string, number> = {};
      rows.forEach((row: { shop_id: string }) => {
        productCountByShopId[row.shop_id] = (productCountByShopId[row.shop_id] ?? 0) + 1;
      });
      shopsForDiscover.forEach((s) => {
        s.productCount = productCountByShopId[s.id] ?? 0;
      });
      setDiscoverShops([...shopsForDiscover]);
      const allProductIds = (productRows ?? []).map((r: { id: string }) => r.id);
      let ratingByProduct: Record<string, { sum: number; count: number }> = {};
      if (allProductIds.length > 0) {
        const { data: reviewRows } = await supabase
          .from('reviews')
          .select('product_id, rating')
          .in('product_id', allProductIds);
        (reviewRows ?? []).forEach((r: { product_id: string; rating: number }) => {
          const id = r.product_id;
          if (!id || r.rating == null) return;
          if (!ratingByProduct[id]) ratingByProduct[id] = { sum: 0, count: 0 };
          ratingByProduct[id].sum += r.rating;
          ratingByProduct[id].count += 1;
        });
      }
      const mapRowToProduct = (row: Parameters<typeof mapDbProductToProduct>[0]) => {
        const p = mapDbProductToProduct(row);
        const agg = ratingByProduct[row.id];
        if (agg && agg.count > 0) {
          p.rating = Math.round((agg.sum / agg.count) * 10) / 10;
          p.reviewCount = agg.count;
        }
        return p;
      };
      const mapped = rows.map((row) => mapRowToProduct(row));
      setProducts(mapped);
      const allMappedProducts = (productRows ?? []).map((row: Parameters<typeof mapDbProductToProduct>[0]) => mapRowToProduct(row));
      const featuredProductsMap: Record<string, Product[]> = {};
      featuredShopsList.forEach((shop) => {
        featuredProductsMap[shop.id] = allMappedProducts.filter((p) => p.shopId === shop.id).slice(0, 3);
      });
      setFeaturedShopProducts(featuredProductsMap);
      setProductsLoading(false);
    })();
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    const max = Math.max(...products.map((p) => p.price));
    return Math.ceil(max / 100) * 100;
  }, [products]);

  const [filters, setFilters] = useState<FilterState>(() => {
    const categoryFromUrl = searchParams.get('category');
    return {
      categories: categoryFromUrl ? [categoryFromUrl] : [],
      colors: [],
      sizes: [],
      priceRange: [0, 1000],
    };
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.categories.length === 1) params.set('category', filters.categories[0]);
    setSearchParams(params, { replace: true });
  }, [searchQuery, filters.categories, setSearchParams]);

  const getShopForProduct = (product: Product): Shop | undefined =>
    realShopsMap[product.shopId];

  const searchTerms = useMemo(
    () =>
      searchQuery
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean),
    [searchQuery]
  );

  const filteredProducts = useMemo(() => {
    const terms = searchTerms;
    return products.filter((product) => {
      const shop = getShopForProduct(product);
      const searchableText = [
        product.name,
        product.description,
        product.category,
        shop?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch =
        terms.length === 0 ||
        terms.every((term) => searchableText.includes(term));
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(product.category);
      const hasColorVariant = product.variants?.some((v) => v.type === 'color');
      const matchesColor =
        filters.colors.length === 0 ||
        !hasColorVariant ||
        (product.variants?.some(
          (v) =>
            v.type === 'color' &&
            v.options.some((opt) => filters.colors.includes(opt))
        ) ?? false);
      const hasSizeVariant = product.variants?.some((v) => v.type === 'size');
      const matchesSize =
        filters.sizes.length === 0 ||
        !hasSizeVariant ||
        (product.variants?.some(
          (v) =>
            v.type === 'size' &&
            v.options.some((opt) => filters.sizes.includes(opt))
        ) ?? false);
      const matchesPrice =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];
      return (
        matchesSearch &&
        matchesCategory &&
        matchesColor &&
        matchesSize &&
        matchesPrice
      );
    });
  }, [searchQuery, filters, products, realShopsMap, searchTerms]);

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

      <div className="container py-6 sm:py-8 px-4 sm:px-6">
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
        <div className="flex flex-col xs:flex-row gap-3 mb-6">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search products, categories, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2.5 sm:py-2 bg-secondary border-0 text-base sm:text-sm"
            />
          </div>
          <FilterSheet
            categories={categories}
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
          {categories.map((category) => {
            const Icon = category.icon;
            return (
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
              <Icon className="mr-1.5 h-4 w-4" />
              {category.name}
            </Button>
            );
          })}
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

        {/* Featured Brands: only shops with Featured toggle on in dev panel */}
        {featuredShops.length > 0 && (
          <FeaturedBrandsCarousel
            shops={featuredShops}
            shopFeaturedProducts={featuredShopProducts}
          />
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {productsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
            <Button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  categories: [],
                  colors: [],
                  sizes: [],
                  priceRange: [0, maxPrice],
                });
              }}
            >
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
                shop={getShopForProduct(product)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DiscoverPage;
