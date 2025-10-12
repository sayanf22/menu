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
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a 
                href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu%20digital%20menu%20service%20for%20my%20restaurant%20in%20Tripura.%20Please%20share%20more%20details." 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="font-medium">WhatsApp: +91 7005832798</span>
              </a>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Serving restaurants in: <strong>Agartala</strong> • <strong>Khowai</strong> • <strong>Belonia</strong> • <strong>Udaipur</strong> • <strong>Dharmanagar</strong> • <strong>Kailashahar</strong> • <strong>Ambassa</strong> • <strong>Teliamura</strong> • <strong>Sabroom</strong> • <strong>Sonamura</strong> • <strong>Bishalgarh</strong> • <strong>Kamalpur</strong> • <strong>Amarpur</strong> • <strong>Ranir Bazar</strong> • <strong>Santir Bazar</strong> • <strong>Melaghar</strong> • <strong>Jirania</strong> • <strong>Mohanpur</strong> • <strong>Kumarghat</strong> • <strong>Panisagar</strong> • <strong>Kanchanpur</strong> • <strong>Manu</strong> • <strong>Longtharai Valley</strong> • <strong>Dhalai</strong> • <strong>Gandacherra</strong> • <strong>Boxanagar</strong>
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {[
            "Agartala", "Khowai", "Belonia", "Udaipur", "Dharmanagar", "Kailashahar",
            "Ambassa", "Teliamura", "Sabroom", "Sonamura", "Bishalgarh", "Kamalpur",
            "Amarpur", "Ranir Bazar", "Santir Bazar", "Melaghar", "Jirania", "Mohanpur",
            "Kumarghat", "Kamalghat", "Panisagar", "Kanchanpur", "Manu", "Longtharai Valley", 
            "Dhalai", "Gandacherra", "Boxanagar", "Dumburnagar", "Fatikroy", "Pecharthal",
            "Kadamtala", "Chailengta", "Hrishyamukh", "Radhakishorepur", "Takarjala"
          ].map((city) => (
            <Card key={city} className="p-4 text-center hover:shadow-md transition-shadow">
              <p className="font-semibold text-sm">{city}</p>
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
            Transform your restaurant with digital menus. Perfect for restaurants in Agartala, Khowai, Belonia, Udaipur, Dharmanagar, and all Tripura cities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-12">
                Get Started Now
              </Button>
            </Link>
            <a 
              href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu%20digital%20menu%20service%20for%20my%20restaurant%20in%20Tripura.%20Please%20share%20more%20details." 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Button size="lg" variant="outline" className="text-lg px-8">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contact on WhatsApp
              </Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            ⭐ Rated 4.8/5 by Tripura restaurants • 📱 Quick Setup • 🚀 Instant QR Codes
          </p>
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
            Our platform serves restaurants in all major cities and towns of Tripura including <strong>Agartala</strong>, <strong>Khowai</strong>, <strong>Belonia</strong>, <strong>Udaipur</strong>, <strong>Dharmanagar</strong>, <strong>Kailashahar</strong>, <strong>Ambassa</strong>, <strong>Teliamura</strong>, <strong>Sabroom</strong>, <strong>Sonamura</strong>, <strong>Bishalgarh</strong>, <strong>Kamalpur</strong>, <strong>Amarpur</strong>, <strong>Ranir Bazar</strong>, <strong>Santir Bazar</strong>, <strong>Melaghar</strong>, <strong>Jirania</strong>, <strong>Mohanpur</strong>, <strong>Kumarghat</strong>, <strong>Panisagar</strong>, <strong>Kanchanpur</strong>, <strong>Manu</strong>, <strong>Longtharai Valley</strong>, <strong>Dhalai</strong>, <strong>Gandacherra</strong>, <strong>Boxanagar</strong>, <strong>Dumburnagar</strong>, <strong>Fatikroy</strong>, and <strong>Pecharthal</strong>.
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
              <p className="text-sm text-muted-foreground mb-2">
                Serving all of Tripura
              </p>
              <a 
                href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu%20digital%20menu%20service%20for%20my%20restaurant%20in%20Tripura.%20Please%20share%20more%20details." 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="font-medium">WhatsApp: +91 7005832798</span>
              </a>
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
