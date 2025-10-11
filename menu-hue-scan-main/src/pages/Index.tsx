import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, BarChart3, Upload, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Transform Your Restaurant Menu Into a{" "}
              <span className="text-primary">Digital Experience</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Upload your menu, generate a QR code, and let customers view it instantly.
              Track views, gather feedback, and grow your business.
            </p>
            <div className="flex justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground">
            Powerful features to help your restaurant succeed
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy Upload</h3>
            <p className="text-muted-foreground">
              Upload your menu images in seconds. Support for multiple images and instant preview.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Instant QR Code</h3>
            <p className="text-muted-foreground">
              Generate a unique QR code for your restaurant. Download in high resolution for printing.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Real-Time Analytics</h3>
            <p className="text-muted-foreground">
              Track how many people view your menu. See daily, weekly, and monthly statistics.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Customer Feedback</h3>
            <p className="text-muted-foreground">
              Collect ratings and reviews directly from your digital menu. Know what customers think.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-4xl font-bold">Ready to Go Digital?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of restaurants already using QR menus to enhance their customer experience
          </p>
          <div className="flex justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12">
                Create Your Account
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MenuQR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
