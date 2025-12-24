import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Lightbulb, Music, Zap, Users, Mic, Clapperboard } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  const services = [
    {
      icon: Lightbulb,
      title: "Lighting Design",
      description: "Professional lighting plots, cue sheets, and technical specifications for any production scale.",
    },
    {
      icon: Clapperboard,
      title: "Staging",
      description: "Stage layouts, rigging plans, and production logistics to maximize your venue.",
    },
    {
      icon: Mic,
      title: "Sound Engineering",
      description: "Audio system design, mixing strategies, and equipment recommendations.",
    },
    {
      icon: Music,
      title: "Music Cues",
      description: "Curated music selections, timing guides, and integration with your production flow.",
    },
    {
      icon: Zap,
      title: "Production Management",
      description: "End-to-end project coordination, scheduling, and team communication tools.",
    },
    {
      icon: Users,
      title: "Consulting",
      description: "Direct access to expert guidance for complex productions and technical challenges.",
    },
  ];

  const tiers = [
    {
      name: "Free",
      price: "Always Free",
      description: "Perfect for getting started",
      features: ["Tutorials & blog", "Basic resource links", "Community access"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$24.99/month",
      description: "For serious creators",
      features: [
        "Advanced guides & plots",
        "Video modules",
        "Cue templates",
        "Priority support",
        "Toolkit access",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Premium",
      price: "$500–$2,000",
      description: "Enterprise solutions",
      features: [
        "Custom consulting",
        "Direct support",
        "On-site assistance",
        "Bespoke solutions",
        "Unlimited resources",
      ],
      cta: "Book Consultation",
      highlighted: false,
    },
  ];

  const testimonials = [
    {
      author: "Sarah Chen",
      title: "Event Director",
      content:
        "This platform transformed how we manage our productions. The lighting templates alone saved us 20 hours per project.",
    },
    {
      author: "Marcus Rodriguez",
      title: "Freelance TD",
      content:
        "The readiness checker helped me catch critical details I would have missed. Absolutely essential for my workflow.",
    },
    {
      author: "Jamie Thompson",
      title: "Theater Producer",
      content:
        "Premium consulting was worth every penny. The custom setup they provided is now our standard for all shows.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-heading-xl neon-glow-pink mb-6">
              Your One-Stop Shop for Full-Scale Productions
            </h1>
            <p className="text-body-lg text-muted-foreground mb-8">
              Professional lighting, staging, sound, music, and production management tools. From free resources to premium consulting—everything you need to execute flawlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-pink"
                onClick={() => navigate("/resources")}
              >
                Explore Resources <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="neon-border-cyan"
                onClick={() => navigate("/book")}
              >
                Book a Consult <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-heading-lg text-center mb-16 neon-glow-pink">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Card
                  key={idx}
                  className="p-6 border-border hover:neon-border-accent transition-neon group cursor-pointer"
                >
                  <Icon className="h-12 w-12 text-accent mb-4 group-hover:text-accent transition-neon" />
                  <h3 className="text-heading-sm font-bold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-body-md text-muted-foreground">{service.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About the TD */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-heading-lg mb-6 neon-glow-pink">About the Technical Director</h2>
              <p className="text-body-lg text-muted-foreground mb-4">
                With over 15 years of experience in live production, I've designed and executed lighting, sound, and staging for hundreds of events ranging from intimate theater productions to large-scale corporate conferences.
              </p>
              <p className="text-body-lg text-muted-foreground mb-6">
                My mission is to democratize professional production knowledge and tools, making it easier for everyone—from freelancers to large teams—to execute productions with confidence and precision.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-body-md">Lighting Design & Programming</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-body-md">Sound System Engineering</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-body-md">Production Management & Coordination</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-body-md">Venue & Equipment Consulting</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-12 border border-border">
              <div className="text-center">
                <div className="inline-block w-32 h-32 bg-accent/30 rounded-full mb-6"></div>
                <h3 className="text-heading-md font-bold mb-2">Technical Director</h3>
                <p className="text-muted-foreground">15+ years of production excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-heading-lg text-center mb-16 neon-glow-pink">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Free Tier */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                    <span className="text-lg font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm font-bold mb-2">Start Free</h3>
                  <p className="text-body-md text-muted-foreground">
                    Access tutorials, blog posts, and basic resource links. Perfect for learning the fundamentals.
                  </p>
                </div>
              </div>

              {/* Pro Tier */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                    <span className="text-lg font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm font-bold mb-2">Upgrade to Pro ($24.99/mo)</h3>
                  <p className="text-body-md text-muted-foreground">
                    Unlock advanced guides, lighting plots, cue templates, video modules, and the Readiness Checker wizard.
                  </p>
                </div>
              </div>

              {/* Premium Tier */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                    <span className="text-lg font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm font-bold mb-2">Go Premium ($500–$2,000)</h3>
                  <p className="text-body-md text-muted-foreground">
                    Get direct consulting, on-site assistance, custom solutions, and unlimited access to all resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-heading-lg text-center mb-16 neon-glow-pink">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, idx) => (
              <Card
                key={idx}
                className={`p-8 border transition-neon ${
                  tier.highlighted
                    ? "neon-border-pink border-2 relative"
                    : "border-border hover:border-accent"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent px-4 py-1 rounded-full text-sm font-bold text-accent-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-heading-md font-bold mb-2">{tier.name}</h3>
                <p className="text-body-lg font-bold text-accent mb-2">{tier.price}</p>
                <p className="text-body-sm text-muted-foreground mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-body-sm">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "border border-border hover:bg-muted"
                  }`}
                  onClick={() => navigate(tier.name === "Premium" ? "/book" : "/pricing")}
                >
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="neon-border-cyan"
              onClick={() => navigate("/pricing")}
            >
              View Full Pricing & FAQ
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-heading-lg text-center mb-16 neon-glow-pink">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6 border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-accent rounded-full"></div>
                  ))}
                </div>
                <p className="text-body-md text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-body-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-accent/20 to-accent/5 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-heading-lg mb-6 neon-glow-pink">Ready to Transform Your Productions?</h2>
          <p className="text-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of production professionals who trust our tools and expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate("/resources")}
            >
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="neon-border-cyan"
              onClick={() => navigate("/book")}
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
