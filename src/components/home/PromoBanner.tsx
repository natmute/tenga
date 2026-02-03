import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PromoBanner = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12"
        >
          {/* Background Elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-1.5 mb-4">
                <Zap className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">
                  Limited Time Offer
                </span>
              </div>
              <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl md:text-4xl">
                Get 20% off your first order
              </h2>
              <p className="mt-2 text-primary-foreground/80 max-w-md">
                Sign up today and receive a special discount code for new members.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/signup">
                Claim Offer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoBanner;
