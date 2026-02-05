import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BadgeCheck, MapPin, Star, Users, Grid3X3, Heart, 
  Share2, MessageCircle, ChevronLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/product/ProductCard';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';
import { shops, getProductsByShopId } from '@/data/mockData';

const ShopPage = () => {
  const { slug } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  const shop = shops.find(s => s.slug === slug);
  const products = shop ? getProductsByShopId(shop.id) : [];

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Shop not found</h1>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      {/* Back Button (Mobile) */}
      <div className="container py-4 md:hidden">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={shop.banner}
          alt={shop.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Shop Info */}
      <div className="container relative">
        <div className="relative -mt-16 md:-mt-20 pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={shop.logo}
                alt={shop.name}
                className="h-28 w-28 md:h-36 md:w-36 rounded-2xl border-4 border-background object-cover shadow-lg"
              />
              {shop.isVerified && (
                <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-2 shadow-md">
                  <BadgeCheck className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold md:text-3xl flex items-center gap-2"
                  >
                    {shop.name}
                    {shop.isVerified && (
                      <span className="text-xs font-normal text-primary bg-accent px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-1 text-muted-foreground flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    {shop.location}
                    <span className="mx-2">•</span>
                    <span className="text-sm px-2 py-0.5 bg-secondary rounded-full">
                      {shop.category}
                    </span>
                  </motion.p>
                </div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={isFollowing ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-gradient-primary'}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              {/* Bio */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 text-foreground max-w-2xl"
              >
                {shop.bio}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 flex items-center gap-6"
              >
                <div className="text-center">
                  <div className="text-xl font-bold">{shop.productCount}</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{(shop.followerCount / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="text-xl font-bold">{shop.rating}</span>
                  <span className="text-xs text-muted-foreground">({shop.reviewCount} reviews)</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <Tabs defaultValue="products" className="mt-6">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
            <TabsTrigger
              value="products"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              <Star className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6 pb-12">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 pb-12">
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
              <p className="text-muted-foreground">
                Reviews will appear here when customers share their experiences.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ShopPage;
