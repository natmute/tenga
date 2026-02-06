import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MapPin, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

interface OrderState {
  orderNumber: string;
  items: { name: string; qty: number; price: number; image: string }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  total: number;
}

const shippingLabels: Record<string, string> = {
  pickup: 'Store Pickup',
  standard: 'Standard Shipping (5–7 days)',
  express: 'Express Shipping (1–3 days)',
};

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state as OrderState | undefined;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--success))]/10 p-4 mb-4"
            >
              <CheckCircle2 className="h-12 w-12 text-[hsl(var(--success))]" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order number is{' '}
              <span className="font-semibold text-foreground">{order.orderNumber}</span>
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border overflow-hidden"
          >
            {/* Items */}
            <div className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                Items Ordered
              </h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            <div className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Address
              </h2>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="text-foreground font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-1">{order.shippingAddress.email} · {order.shippingAddress.phone}</p>
              </div>
            </div>

            <Separator />

            {/* Shipping Method */}
            <div className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                Shipping Method
              </h2>
              <p className="text-sm text-muted-foreground">
                {shippingLabels[order.shippingMethod] || order.shippingMethod}
              </p>
            </div>

            <Separator />

            {/* Totals */}
            <div className="p-6 bg-secondary/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button onClick={() => navigate('/discover')} className="bg-gradient-primary">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
