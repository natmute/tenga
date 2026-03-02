import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, UserPlus, ShoppingBag, Store, Ban, Award, AlertTriangle, Scale, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: "By accessing and using Tenga Virtual Mall, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.",
  },
  {
    icon: UserPlus,
    title: "2. Account Registration",
    content: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.",
  },
  {
    icon: ShoppingBag,
    title: "3. Buying on Tenga",
    content: "When you purchase a product, you enter into a transaction with the seller. Tenga facilitates the transaction but is not a party to the sale. Prices, availability, and product descriptions are set by individual sellers.",
  },
  {
    icon: Store,
    title: "4. Selling on Tenga",
    content: "Sellers must comply with all applicable laws and regulations. You are responsible for the accuracy of your product listings, timely fulfilment, and customer service. Tenga reserves the right to remove listings or suspend accounts that violate our policies.",
  },
  {
    icon: Ban,
    title: "5. Prohibited Activities",
    content: "You may not use our platform to sell counterfeit goods, engage in fraud, harass other users, or violate any applicable laws. We reserve the right to suspend or terminate accounts engaged in prohibited activities.",
  },
  {
    icon: Award,
    title: "6. Intellectual Property",
    content: "All content on Tenga, including logos, design, and software, is the property of Tenga or its licensors. Sellers retain ownership of their product content but grant Tenga a licence to display it on the platform.",
  },
  {
    icon: AlertTriangle,
    title: "7. Limitation of Liability",
    content: 'Tenga is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
  },
  {
    icon: Scale,
    title: "8. Dispute Resolution",
    content: "Any disputes between buyers and sellers should first be resolved directly. If a resolution cannot be reached, Tenga may mediate at its discretion. Legal disputes shall be governed by the laws of Zimbabwe.",
  },
  {
    icon: RefreshCw,
    title: "9. Changes to Terms",
    content: "We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.",
  },
  {
    icon: Mail,
    title: "10. Contact",
    content: "For questions about these Terms, please visit our contact page.",
    link: "/contact-us",
  },
];

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/50 py-16">
          <div className="container text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: February 12, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="container py-12 max-w-3xl mx-auto">
          <div className="space-y-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="rounded-xl border border-border p-6 transition-colors hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                        {section.link && (
                          <>
                            {" "}
                            <a href={section.link} className="text-primary hover:underline font-medium">
                              Visit our contact page →
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
