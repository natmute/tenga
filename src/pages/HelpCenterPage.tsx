import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Truck, CreditCard, RotateCcw, UserCog, ShieldCheck } from "lucide-react";
import { useState } from "react";

const faqCategories = [
  {
    icon: ShoppingBag,
    title: "Orders & Shopping",
    faqs: [
      { q: "How do I place an order?", a: "Browse products, add items to your cart, and proceed to checkout. You can pay using any of our supported payment methods." },
      { q: "Can I modify my order after placing it?", a: "You can modify your order within 30 minutes of placing it by visiting your order history and selecting 'Edit Order'." },
      { q: "How do I track my order?", a: "Once your order is shipped, you'll receive a tracking link via email. You can also check your order status in your account dashboard." },
    ],
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    faqs: [
      { q: "What are the shipping options?", a: "We offer standard (3-5 business days), express (1-2 business days), and same-day delivery in select areas." },
      { q: "Do you ship internationally?", a: "Currently, we ship within the country. International shipping is coming soon." },
      { q: "How much does shipping cost?", a: "Shipping costs depend on the seller and delivery method. Free shipping is available on select orders over a certain amount." },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments",
    faqs: [
      { q: "What payment methods are accepted?", a: "We accept mobile money, bank cards (Visa/Mastercard), and cash on delivery in supported areas." },
      { q: "Is my payment information secure?", a: "Yes. All transactions are encrypted and processed through secure payment gateways. We never store your full card details." },
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns & Refunds",
    faqs: [
      { q: "What is the return policy?", a: "Most items can be returned within 7 days of delivery. Items must be unused and in original packaging." },
      { q: "How long do refunds take?", a: "Refunds are processed within 5-10 business days after we receive the returned item." },
    ],
  },
  {
    icon: UserCog,
    title: "Account & Profile",
    faqs: [
      { q: "How do I create an account?", a: "Click 'Sign In' in the top menu and select 'Sign Up'. Enter your email and create a password to get started." },
      { q: "How do I reset my password?", a: "On the sign-in page, click 'Forgot Password' and follow the instructions sent to your email." },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Selling on Tenga",
    faqs: [
      { q: "How do I open a shop?", a: "Navigate to 'Open a Shop' from the menu or footer. Fill in your shop details and you'll be set up in minutes." },
      { q: "What fees does Tenga charge sellers?", a: "Tenga charges a small commission on each sale. Visit our Pricing page for detailed information." },
    ],
  },
];

const HelpCenterPage = () => {
  const [search, setSearch] = useState("");

  const filtered = faqCategories
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="bg-muted/50 py-16">
          <div className="container text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-muted-foreground mb-6">
              Search our FAQ or browse categories below.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="container py-12 max-w-3xl mx-auto">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No results found. Try a different search term.
            </p>
          )}
          {filtered.map((cat) => (
            <div key={cat.title} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <cat.icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{cat.title}</h2>
              </div>
              <Accordion type="single" collapsible>
                {cat.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`${cat.title}-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenterPage;
