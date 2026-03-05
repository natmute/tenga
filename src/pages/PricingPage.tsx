import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: ["Up to 10 products", "Basic analytics", "Standard support", "2% commission per sale"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    price: "$15/mo",
    description: "For growing businesses",
    features: ["Up to 100 products", "Advanced analytics", "Priority support", "1.5% commission per sale", "Custom shop branding", "Promotional tools"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale sellers",
    features: ["Unlimited products", "Full analytics suite", "Dedicated account manager", "1% commission per sale", "API access", "Custom integrations"],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-12 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Choose the plan that fits your business. Start selling today with no upfront costs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-3xl font-bold mt-2">{plan.price}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link to={plan.cta === "Contact Sales" ? "/contact-sales" : "/open-shop"}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
