import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const stories = [
  {
    name: "Amina Hassan",
    shop: "Amina's Fabrics",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face",
    quote: "Tenga helped me grow my fabric business from a small stall to serving customers across the country. My sales tripled in just 6 months!",
    revenue: "KSh 450,000/mo",
  },
  {
    name: "David Ochieng",
    shop: "TechGadgets KE",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    quote: "The seller dashboard makes it so easy to manage orders and inventory. I can focus on sourcing great products instead of logistics.",
    revenue: "KSh 1,200,000/mo",
  },
  {
    name: "Grace Wanjiku",
    shop: "Nature's Glow Beauty",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    quote: "Starting on Tenga was the best decision for my beauty brand. The platform's reach connected me with customers I never could have found on my own.",
    revenue: "KSh 280,000/mo",
  },
  {
    name: "James Mwangi",
    shop: "Mwangi Fresh Produce",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    quote: "From farm to table — Tenga gave my fresh produce business a digital storefront. Now I deliver to hundreds of homes every week.",
    revenue: "KSh 600,000/mo",
  },
];

const SuccessStoriesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Seller Success Stories</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">See how entrepreneurs are building thriving businesses on Tenga.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {stories.map((story) => (
            <Card key={story.name} className="overflow-hidden">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/20 mb-3" />
                <p className="text-sm mb-6 italic text-muted-foreground">"{story.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={story.image} alt={story.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{story.name}</p>
                    <p className="text-xs text-muted-foreground">{story.shop}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="flex gap-0.5 justify-end mb-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-primary">{story.revenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessStoriesPage;
