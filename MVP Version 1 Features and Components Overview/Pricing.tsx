import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // tRPC mutation for creating checkout session
  const createCheckoutMutation = trpc.subscription.createCheckout.useMutation();

  const tiers = [
    {
      name: "Free",
      price: "Always Free",
      description: "Perfect for getting started",
      features: [
        "Tutorials & blog posts",
        "Basic resource links",
        "Community access",
        "Email support",
      ],
      notIncluded: [
        "Advanced guides & plots",
        "Video modules",
        "Readiness Checker",
        "Priority support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$24.99/month",
      description: "For serious creators",
      features: [
        "Everything in Free",
        "Advanced guides & lighting plots",
        "Video learning modules",
        "Cue sheet templates",
        "Readiness Checker wizard",
        "Priority email support",
        "Downloadable resources",
        "Monthly updates",
      ],
      notIncluded: ["Direct consulting", "On-site assistance"],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Premium",
      price: "$500–$2,000",
      description: "Enterprise solutions",
      features: [
        "Everything in Pro",
        "Direct consulting access",
        "On-site assistance",
        "Custom solutions",
        "Unlimited resources",
        "Dedicated support",
        "Custom training",
        "Quarterly strategy sessions",
      ],
      notIncluded: [],
      cta: "Book Consultation",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "Can I cancel my Pro subscription anytime?",
      answer:
        "Yes, you can cancel your Pro subscription at any time. Your access will continue until the end of your current billing period.",
    },
    {
      question: "Do you offer discounts for annual billing?",
      answer:
        "Yes! Subscribe annually and save 15% on your Pro plan. Contact us for details.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.",
    },
    {
      question: "Is there a free trial for Pro?",
      answer:
        "Yes! New Pro subscribers get a 7-day free trial. No credit card required to start.",
    },
    {
      question: "How do I upgrade from Free to Pro?",
      answer:
        "Click the 'Start Free Trial' button on the Pro tier. You'll be guided through a quick checkout process.",
    },
  ];

  const handleProCheckout = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = getLoginUrl();
      return;
    }

    setCheckoutLoading(true);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        successUrl: `${window.location.origin}/portal?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing?checkout=canceled`,
      });

      // Redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleTierClick = (tierName: string) => {
    if (tierName === "Premium") {
      navigate("/book");
    } else if (tierName === "Pro") {
      handleProCheckout();
    } else if (tierName === "Free") {
      if (!isAuthenticated) {
        window.location.href = getLoginUrl();
      } else {
        navigate("/resources");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 md:py-32 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 neon-glow-pink">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground mb-8">
              Choose the plan that fits your production needs. From free resources to premium consulting, we have you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, idx) => (
              <Card
                key={idx}
                className={`p-8 border transition-neon flex flex-col ${
                  tier.highlighted
                    ? "neon-border-pink border-2 relative md:scale-105"
                    : "border-border hover:border-accent"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent px-4 py-1 rounded-full text-sm font-bold text-accent-foreground">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground mb-4">{tier.description}</p>
                  <div className="mb-2">
                    <span className="text-3xl md:text-4xl font-bold text-accent">{tier.price}</span>
                    {tier.name === "Pro" && <span className="text-sm text-muted-foreground ml-2">billed monthly</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3 text-sm leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded.length > 0 && (
                    <>
                      <li className="pt-2 border-t border-border"></li>
                      {tier.notIncluded.map((feature, fidx) => (
                        <li key={`not-${fidx}`} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-muted rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </>
                  )}
                </ul>

                <Button
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "border border-border hover:bg-muted"
                  }`}
                  onClick={() => handleTierClick(tier.name)}
                  disabled={checkoutLoading && tier.name === "Pro"}
                >
                  {checkoutLoading && tier.name === "Pro" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center neon-glow-pink">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card
                  key={idx}
                  className="p-6 border-border cursor-pointer hover:border-accent transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold leading-relaxed pr-4">{faq.question}</h3>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${
                        expandedFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {expandedFaq === idx && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent/20 to-accent/5 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 neon-glow-pink">
            Ready to Level Up?
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of production professionals using our tools to execute flawlessly.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => handleProCheckout()}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Pro Trial"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
