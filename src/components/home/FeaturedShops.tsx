import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ShopCard from '@/components/shop/ShopCard';
import { getFeaturedShops } from '@/data/mockData';

const FeaturedShops = () => {
  const featuredShops = getFeaturedShops();

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold sm:text-3xl"
            >
              Featured Shops
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-muted-foreground"
            >
              Discover our handpicked collection of verified sellers
            </motion.p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link to="/shops">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredShops.map((shop, index) => (
            <ShopCard key={shop.id} shop={shop} index={index} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link to="/shops">
              View All Shops
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;
