import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Shield, Eye, Users, Lock, UserCheck, Cookie, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content: "We collect information you provide directly, such as your name, email address, and payment details when you create an account, make a purchase, or contact us. We also automatically collect usage data including IP address, browser type, and browsing behaviour on our platform.",
  },
  {
    icon: Users,
    title: "2. How We Use Your Information",
    content: "We use the information we collect to operate and improve our services, process transactions, communicate with you, and personalise your shopping experience. We may also use your data for security purposes and to comply with legal obligations.",
  },
  {
    icon: Shield,
    title: "3. Information Sharing",
    content: "We do not sell your personal information. We may share your data with sellers on our platform to fulfil orders, with payment processors to complete transactions, and with service providers who help us operate our platform.",
  },
  {
    icon: Lock,
    title: "4. Data Security",
    content: "We implement industry-standard security measures to protect your personal information, including encryption of data in transit and at rest. However, no method of transmission over the internet is 100% secure.",
  },
  {
    icon: UserCheck,
    title: "5. Your Rights",
    content: "You have the right to access, correct, or delete your personal data. You can update your account information at any time or contact us to exercise your rights.",
  },
  {
    icon: Cookie,
    title: "6. Cookies",
    content: "We use cookies and similar technologies to enhance your experience, analyse usage, and deliver personalised content. You can manage your cookie preferences through your browser settings.",
  },
  {
    icon: RefreshCw,
    title: "7. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.",
  },
  {
    icon: Mail,
    title: "8. Contact Us",
    content: "If you have any questions about this Privacy Policy, please contact us through our contact page.",
    link: "/contact-us",
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/50 py-16">
          <div className="container text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
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

export default PrivacyPolicyPage;
