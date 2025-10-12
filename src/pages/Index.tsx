import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, BarChart3, Upload, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO />
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
              <span className="text-primary">AddMenu</span> - Digital Menu QR Code for Restaurants in{" "}
              <span className="text-primary">Tripura</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Best digital menu solution for restaurants in Agartala, Khowai, Belonia, Udaipur, Dharmanagar & all Tripura cities. 
              Create QR code menus, track analytics, and get customer feedback instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                ✓ Free for 30 days • ✓ No credit card required
              </p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Serving restaurants in: <strong>Agartala</strong> • <strong>Khowai</strong> • <strong>Belonia</strong> • <strong>Udaipur</strong> • <strong>Dharmanagar</strong> • <strong>Kailashahar</strong> • <strong>Ambassa</strong> • <strong>Teliamura</strong> • <strong>Sabroom</strong> • <strong>Sonamura</strong> • <strong>Bishalgarh</strong> • <strong>Kamalpur</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl font-bold mb-4">Why Tripura Restaurants Choose AddMenu</h2>
          <p className="text-xl text-muted-foreground">
            Powerful digital menu features designed for restaurants in Agartala and across Tripura
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Easy Menu Upload</h3>
            <p className="text-muted-foreground">
              Upload your restaurant menu in seconds. Perfect for cafes, restaurants, and food joints across Tripura. Multiple images supported.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">QR Code Generator</h3>
            <p className="text-muted-foreground">
              Generate contactless menu QR codes instantly. Download high-resolution QR codes for printing at your Agartala or Khowai restaurant.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Menu Analytics</h3>
            <p className="text-muted-foreground">
              Track menu views in real-time. See which dishes are popular. Perfect for restaurants in Belonia, Udaipur, and all Tripura cities.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Customer Reviews</h3>
            <p className="text-muted-foreground">
              Collect instant feedback from diners. Build your restaurant's reputation in Dharmanagar, Kailashahar, and across Tripura.
            </p>
          </Card>
        </div>
      </section>

      {/* Location Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Serving Restaurants Across Tripura</h2>
          <p className="text-xl text-muted-foreground">
            AddMenu is trusted by restaurants in all major cities of Tripura
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {[
            "Agartala", "Khowai", "Belonia", "Udaipur", "Dharmanagar", "Kailashahar",
            "Ambassa", "Teliamura", "Sabroom", "Sonamura", "Bishalgarh", "Kamalpur",
            "Amarpur", "Ranir Bazar", "Santir Bazar", "Melaghar"
          ].map((city) => (
            <Card key={city} className="p-4 text-center hover:shadow-md transition-shadow">
              <p className="font-semibold">{city}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Digital Menus Are Perfect for Tripura Restaurants
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">✓ Contactless & Hygienic</h3>
              <p className="text-muted-foreground">
                Perfect for post-pandemic dining. Customers scan QR code with their phone - no physical menu needed.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">✓ Update Anytime</h3>
              <p className="text-muted-foreground">
                Change prices, add new dishes, or update availability instantly. No need to reprint menus.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">✓ Cost Effective</h3>
              <p className="text-muted-foreground">
                Save money on printing. One QR code works forever. Perfect for small restaurants in Tripura.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">✓ Multilingual Support</h3>
              <p className="text-muted-foreground">
                Show menus in Bengali, Hindi, English - perfect for diverse customers across Tripura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-4xl font-bold">Join 100+ Tripura Restaurants Using AddMenu</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start your free 30-day trial today. No credit card required. Perfect for restaurants in Agartala, Khowai, Belonia, and all Tripura cities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12">
                Create Free Account
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              ⭐ Rated 4.8/5 by Tripura restaurants
            </p>
          </div>
        </Card>
      </section>

      {/* SEO Content Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/20">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-3xl font-bold mb-6">
            Digital Menu QR Code Solution for Restaurants in Tripura
          </h2>
          <p className="text-muted-foreground mb-4">
            <strong>AddMenu</strong> is the leading digital menu platform designed specifically for restaurants, cafes, and food businesses across <strong>Tripura</strong>. Whether you run a restaurant in <strong>Agartala</strong>, a cafe in <strong>Khowai</strong>, or a food joint in <strong>Belonia</strong>, AddMenu helps you create professional QR code menus in minutes.
          </p>
          <p className="text-muted-foreground mb-4">
            Our platform serves restaurants in all major cities of Tripura including <strong>Udaipur</strong>, <strong>Dharmanagar</strong>, <strong>Kailashahar</strong>, <strong>Ambassa</strong>, <strong>Teliamura</strong>, <strong>Sabroom</strong>, <strong>Sonamura</strong>, <strong>Bishalgarh</strong>, <strong>Kamalpur</strong>, <strong>Amarpur</strong>, <strong>Ranir Bazar</strong>, and <strong>Santir Bazar</strong>.
          </p>
          <h3 className="text-2xl font-bold mt-8 mb-4">
            How AddMenu Works for Tripura Restaurants
          </h3>
          <p className="text-muted-foreground mb-4">
            1. <strong>Upload Your Menu</strong> - Take photos of your menu or upload existing images<br/>
            2. <strong>Generate QR Code</strong> - Get a unique QR code for your restaurant instantly<br/>
            3. <strong>Print & Display</strong> - Download and print your QR code for tables<br/>
            4. <strong>Track Analytics</strong> - See how many customers view your menu daily
          </p>
          <h3 className="text-2xl font-bold mt-8 mb-4">
            Perfect for All Restaurant Types in Tripura
          </h3>
          <p className="text-muted-foreground">
            AddMenu works great for fine dining restaurants, casual cafes, street food vendors, cloud kitchens, bakeries, sweet shops, and all food businesses across Tripura. Start your digital transformation today!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">AddMenu</h3>
              <p className="text-sm text-muted-foreground">
                Digital menu QR code solution for restaurants in Tripura
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cities We Serve</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Agartala</li>
                <li>Khowai</li>
                <li>Belonia</li>
                <li>Udaipur</li>
                <li>Dharmanagar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>QR Code Generator</li>
                <li>Menu Analytics</li>
                <li>Customer Feedback</li>
                <li>Easy Updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                Serving all of Tripura<br/>
                Email: support@addmenu.in
              </p>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 AddMenu. All rights reserved. | Digital Menu Solution for Tripura Restaurants</p>
            <p className="mt-2">
              <strong>Keywords:</strong> Digital Menu Tripura, QR Code Menu Agartala, Restaurant Menu Khowai, Contactless Menu Belonia, Menu Maker Tripura
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
