import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, Home, CreditCard, Users, Phone, ChevronRight } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();

  // Close menu on route change with animation
  useEffect(() => {
    if (isMenuOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsAnimating(false);
      }, 200);
    }
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const mainMenuItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Pricing", path: "/pricing", icon: CreditCard },
    { label: "About", path: "/about", icon: Users },
    { label: "Contact", path: "/contact", icon: Phone },
  ];

  const legalMenuItems = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Refund Policy", path: "/refund" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/favicon.png"
              alt="AddMenu"
              className="w-9 h-9 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
            />
            <span className="text-xl font-bold tracking-tight">AddMenu</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {mainMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive(item.path)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } active:scale-95`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth" className="hidden md:block">
              <Button size="sm" className="rounded-full px-5 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20">
                Get Started
              </Button>
            </Link>

            {/* Mobile Menu Button - Animated Hamburger */}
            <button
              className="md:hidden relative w-10 h-10 rounded-xl border-2 border-border hover:border-primary flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={handleMenuToggle}
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 origin-center ${
                    isMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                    isMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 origin-center ${
                    isMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-all duration-300 ${
          isMenuOpen && !isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleLinkClick}
      />

      {/* Mobile Menu Panel - Slides from Right */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[300px] bg-background border-l shadow-2xl md:hidden transition-all duration-300 ease-out ${
          isMenuOpen && !isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 active:scale-95"
            onClick={handleLinkClick}
          >
            <img src="/favicon.png" alt="AddMenu" className="w-8 h-8" />
            <span className="font-bold">AddMenu</span>
          </Link>
          <button
            onClick={handleLinkClick}
            className="w-10 h-10 rounded-xl border-2 border-border hover:border-primary flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-[calc(100%-65px)] overflow-y-auto">
          {/* Main Navigation */}
          <nav className="p-4 space-y-2">
            {mainMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-muted active:scale-[0.98]"
                  }`}
                  onClick={handleLinkClick}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    transform: isMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                    opacity: isMenuOpen ? 1 : 0,
                    transition: `all 0.3s ease ${index * 50}ms`
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="px-4">
            <div className="border-t" />
          </div>

          {/* Legal Links */}
          <nav className="p-4 space-y-1">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Legal
            </p>
            {legalMenuItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all duration-300 active:scale-[0.98]"
                onClick={handleLinkClick}
                style={{ 
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                  opacity: isMenuOpen ? 1 : 0,
                  transition: `all 0.3s ease ${(mainMenuItems.length + index) * 50}ms`
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="mt-auto p-4 border-t">
            <Link to="/auth" onClick={handleLinkClick}>
              <Button className="w-full rounded-2xl h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20">
                Get Started Free
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-3">
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
