import { motion } from 'framer-motion';
import { TrendingUp, Heart } from 'lucide-react';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { products, getShopById } from '@/data/mockData';

const TrendingPage = () => {
  // Get top 20 most liked products
  const trendingProducts = [...products]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">Trending Now</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Top 20 most loved products on Tenga
          </motion.p>
        </div>

        {/* Trending Products */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {trendingProducts.map((product, index) => {
            const shop = getShopById(product.shopId);
            return (
              <div key={product.id} className="relative">
                {/* Rank Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground shadow-lg"
                >
                  {index + 1}
                </motion.div>
                
                <ProductCard
                  product={product}
                  shop={shop}
                  index={index}
                />
                
                {/* Like Count Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 + 0.2 }}
                  className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm"
                >
                  <Heart className="h-3 w-3 fill-primary text-primary" />
                  {product.likeCount}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {trendingProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No trending products yet</h3>
            <p className="text-muted-foreground">
              Check back later for popular items
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TrendingPage;
