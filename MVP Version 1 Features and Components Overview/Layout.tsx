import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "/resources" },
    { label: "Toolkit", href: "/toolkit" },
    { label: "Book", href: "/book" },
    { label: "Shop", href: "/shop" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Navigation */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="text-heading-sm neon-glow-pink font-bold">
              TD Services
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-neon rounded ${
                    isActive(item.href)
                      ? "text-accent neon-glow-pink"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <a href="/portal" className="text-sm font-medium hover:text-accent transition-neon">
                    Portal
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logout()}
                    className="neon-border-pink"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Login
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded transition-neon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2 pb-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-medium transition-neon rounded ${
                    isActive(item.href)
                      ? "text-accent neon-glow-pink bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {user ? (
                <>
                  <a
                    href="/portal"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-neon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Portal
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full neon-border-pink"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = getLoginUrl();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Login
                </Button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-heading-sm neon-glow-pink font-bold mb-4">TD Services</h3>
              <p className="text-body-sm text-muted-foreground">
                Your one-stop shop for full-scale productions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-body-sm">
                <li>
                  <a href="/pricing" className="text-muted-foreground hover:text-accent transition-neon">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/resources" className="text-muted-foreground hover:text-accent transition-neon">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="/portfolio" className="text-muted-foreground hover:text-accent transition-neon">
                    Portfolio
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Services</h4>
              <ul className="space-y-2 text-body-sm">
                <li>
                  <a href="/book" className="text-muted-foreground hover:text-accent transition-neon">
                    Book a Consult
                  </a>
                </li>
                <li>
                  <a href="/shop" className="text-muted-foreground hover:text-accent transition-neon">
                    Shop
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-accent transition-neon">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-body-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-neon">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-neon">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-body-sm text-muted-foreground">
            <p>&copy; 2024 TD Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
