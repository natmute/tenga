import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedShops from '@/components/home/FeaturedShops';
import TrendingProducts from '@/components/home/TrendingProducts';
import PromoBanner from '@/components/home/PromoBanner';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedShops />
        <TrendingProducts />
        <PromoBanner />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary">
                  <span className="text-sm font-bold text-primary-foreground">M</span>
                </div>
                <span className="font-display text-lg font-bold">Mallify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your favorite shops, all in one place.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/discover" className="hover:text-foreground">Discover</a></li>
                <li><a href="/shops" className="hover:text-foreground">All Shops</a></li>
                <li><a href="/categories" className="hover:text-foreground">Categories</a></li>
                <li><a href="/trending" className="hover:text-foreground">Trending</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Sell</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Open a Shop</a></li>
                <li><a href="#" className="hover:text-foreground">Seller Dashboard</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Mallify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
