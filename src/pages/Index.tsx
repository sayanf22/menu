import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, BarChart3, Upload, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO />
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/favicon.png" 
                alt="AddMenu Logo" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain animate-fade-in drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AddMenu
              </span>
              <br />
              <span className="text-2xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2 block">
                Digital Menu & Online Ordering
              </span>
              <span className="text-xl md:text-2xl lg:text-3xl font-normal text-muted-foreground mt-2 block">
                for Restaurants in Tripura
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create contactless QR code menus, accept online orders, and manage table bookings. 
              Complete restaurant management solution for Agartala, Khowai, Belonia & all Tripura cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex gap-3">
                <a 
                  href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu%20digital%20menu%20service%20for%20my%20restaurant%20in%20Tripura.%20Please%20share%20more%20details." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
                  aria-label="Contact us on WhatsApp"
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/addmenu.in_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="mailto:addmenu.in@gmail.com" 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                  aria-label="Email us"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="pt-6 flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-4 py-2 bg-primary/10 rounded-full">Agartala</span>
              <span className="px-4 py-2 bg-primary/10 rounded-full">Khowai</span>
              <span className="px-4 py-2 bg-primary/10 rounded-full">Belonia</span>
              <span className="px-4 py-2 bg-primary/10 rounded-full">Udaipur</span>
              <span className="px-4 py-2 bg-primary/10 rounded-full">Dharmanagar</span>
              <span className="px-4 py-2 bg-primary/10 rounded-full">+30 More Cities</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Images */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How AddMenu Makes It Easy</h2>
          <p className="text-xl text-muted-foreground">
            Simple 3-step process to digitize your restaurant menu
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="mb-6 mx-auto w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <svg className="w-24 h-24 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-2xl font-bold mb-3">Upload Menu</h3>
            <p className="text-muted-foreground">Take photos of your menu or upload existing images. Multiple pages supported.</p>
          </div>

          <div className="text-center">
            <div className="mb-6 mx-auto w-full h-48 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-24 h-24 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-2xl font-bold mb-3">Get QR Code</h3>
            <p className="text-muted-foreground">Instantly generate a unique QR code. Download and print for your tables.</p>
          </div>

          <div className="text-center">
            <div className="mb-6 mx-auto w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <svg className="w-24 h-24 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-2xl font-bold mb-3">Track Analytics</h3>
            <p className="text-muted-foreground">See real-time views, customer feedback, and menu performance data.</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Trusted by Restaurants Across Tripura</h2>
          <p className="text-xl text-muted-foreground">
            Join 100+ restaurants already using AddMenu
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">100+</div>
            <p className="text-muted-foreground">Active Restaurants</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">10K+</div>
            <p className="text-muted-foreground">Menu Views/Month</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">4.8★</div>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">35+</div>
            <p className="text-muted-foreground">Cities Covered</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
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

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Restaurant Owners Say</h2>
          <p className="text-xl text-muted-foreground">
            Real feedback from Tripura restaurants
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground mb-4">"AddMenu made it so easy to go digital. Our customers love scanning the QR code instead of waiting for physical menus. Highly recommended!"</p>
            <div className="font-semibold">Rajesh Kumar</div>
            <div className="text-sm text-muted-foreground">Owner, Spice Garden - Agartala</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground mb-4">"Perfect solution for our restaurant in Khowai. The analytics help us understand what dishes are popular. Setup took only 10 minutes!"</p>
            <div className="font-semibold">Priya Sharma</div>
            <div className="text-sm text-muted-foreground">Manager, Taste of Tripura - Khowai</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground mb-4">"Cost-effective and professional. We saved money on printing menus and can update prices anytime. Great for small restaurants like ours."</p>
            <div className="font-semibold">Amit Das</div>
            <div className="text-sm text-muted-foreground">Owner, Cafe Delight - Belonia</div>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
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

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Start with our Basic digital menu or scale up with Premium's complete restaurant management system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="p-8 space-y-6 hover:shadow-xl transition-shadow border-2">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-2">Basic</h3>
              <p className="text-muted-foreground mb-4">Perfect for small restaurants</p>
              <div className="text-5xl font-bold mb-2">₹499<span className="text-xl text-muted-foreground">/month</span></div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Digital Menu with QR Code</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Upload Menu Images</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Basic Analytics Dashboard</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Customer Feedback</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Social Media Links</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Unlimited Menu Updates</span>
              </div>
            </div>

            <Link to="/auth" className="block">
              <Button size="lg" className="w-full text-lg">
                Get Started with Basic
              </Button>
            </Link>
          </Card>

          {/* Premium Plan */}
          <Card className="p-8 space-y-6 hover:shadow-xl transition-shadow border-2 border-primary relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-white px-6 py-2 text-sm font-bold shadow-lg">
              MOST POPULAR
            </div>
            
            <div className="text-center pt-4">
              <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Premium</h3>
              <p className="text-muted-foreground mb-4">Complete restaurant management solution</p>
              <div className="text-4xl font-bold mb-2">
                Custom Pricing
              </div>
              <p className="text-sm text-muted-foreground">Based on your restaurant needs</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold">Everything in Basic, plus:</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><strong>Online Food Ordering System</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><strong>Multi-Location Support</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><strong>WhatsApp Integration</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><strong>Advanced Analytics & Reports</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><strong>Menu Categories & Organization</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span><strong>Restaurant Logo & Branding</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Custom Branding & White Label</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Dedicated Account Manager</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>24/7 Priority Support</span>
              </div>
            </div>

            <a 
              href="https://menu-premium.pages.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg">
                Explore Premium Features
              </Button>
            </a>
            <p className="text-xs text-center text-muted-foreground">
              Contact us for a personalized quote
            </p>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4 text-lg">
            Need a custom plan? Contact us for enterprise solutions
          </p>
          <a 
            href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu%20pricing%20for%20my%20restaurant%20in%20Tripura." 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-lg font-semibold"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Chat with us on WhatsApp for Custom Pricing
          </a>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Basic vs Premium: What's Right for You?</h2>
          <p className="text-xl text-muted-foreground">
            Compare features and choose the perfect plan for your restaurant
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card className="p-6 h-full">
                <h3 className="text-2xl font-bold mb-4">Feature</h3>
                <div className="space-y-4 text-sm">
                  <div className="py-3 border-b">Digital Menu QR Code</div>
                  <div className="py-3 border-b">Menu Image Upload</div>
                  <div className="py-3 border-b">Analytics Dashboard</div>
                  <div className="py-3 border-b">Customer Feedback</div>
                  <div className="py-3 border-b">Social Media Links</div>
                  <div className="py-3 border-b">Online Ordering</div>
                  <div className="py-3 border-b">WhatsApp Integration</div>
                  <div className="py-3 border-b">Multi-Location Support</div>
                  <div className="py-3 border-b">Menu Categories</div>
                  <div className="py-3 border-b">Restaurant Logo</div>
                  <div className="py-3 border-b">Custom Branding</div>
                  <div className="py-3">24/7 Support</div>
                </div>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="p-6 h-full border-2">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold">Basic</h3>
                  <p className="text-3xl font-bold text-primary mt-2">₹499/mo</p>
                </div>
                <div className="space-y-4 text-sm text-center">
                  <div className="py-3 border-b"><span className="text-green-500 text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-green-500 text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-green-500 text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-green-500 text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-green-500 text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-gray-300 text-2xl">✗</span></div>
                  <div className="py-3 border-b"><span className="text-gray-300 text-2xl">✗</span></div>
                  <div className="py-3 border-b"><span className="text-gray-300 text-2xl">✗</span></div>
                  <div className="py-3 border-b"><span className="text-gray-300 text-2xl">✗</span></div>
                  <div className="py-3 border-b"><span className="text-gray-300 text-2xl">✗</span></div>
                  <div className="py-3 border-b"><span className="text-gray-300 text-2xl">✗</span></div>
                  <div className="py-3">Email Support</div>
                </div>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="p-6 h-full border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center mb-4">
                  <div className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-bold mb-2">RECOMMENDED</div>
                  <h3 className="text-2xl font-bold">Premium</h3>
                  <p className="text-2xl font-bold text-primary mt-2">Custom</p>
                </div>
                <div className="space-y-4 text-sm text-center">
                  <div className="py-3 border-b"><span className="text-primary text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl font-bold">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl font-bold">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl font-bold">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl font-bold">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl font-bold">✓</span></div>
                  <div className="py-3 border-b"><span className="text-primary text-2xl font-bold">✓</span></div>
                  <div className="py-3">24/7 Priority</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
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
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
              aria-label="Contact us on WhatsApp"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            ⭐ Rated 4.8/5 by Tripura restaurants • 📱 Quick Setup • 🚀 Instant QR Codes
          </p>
        </Card>
      </section>

      {/* FAQ Section for SEO */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">How much does AddMenu cost?</h3>
              <p className="text-muted-foreground">
                AddMenu offers two plans: <strong>Basic at ₹499/month</strong> with digital menu, QR codes, and analytics, and <strong>Premium with custom pricing</strong> that includes online ordering, WhatsApp integration, multi-location support, advanced analytics, and more. Contact us on WhatsApp for Premium pricing based on your restaurant size and needs.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">What's included in the Premium plan?</h3>
              <p className="text-muted-foreground">
                Premium includes everything in Basic plus: Online food ordering system, WhatsApp integration for orders, multi-location support, advanced analytics & reports, menu categories & organization, restaurant logo & branding, custom white-label options, dedicated account manager, and 24/7 priority support. Perfect for restaurants looking to scale their operations in Tripura.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">Can I update my menu anytime?</h3>
              <p className="text-muted-foreground">
                Yes! Update your menu, prices, and items anytime from your dashboard. Changes reflect instantly - no need to reprint menus.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">Do I need technical knowledge?</h3>
              <p className="text-muted-foreground">
                Not at all! AddMenu is designed for restaurant owners with no technical background. Simply upload photos and you're done. We provide full support in Hindi, English, and Bengali.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">Which cities in Tripura do you serve?</h3>
              <p className="text-muted-foreground">
                We serve all cities in Tripura including Agartala, Khowai, Belonia, Udaipur, Dharmanagar, Kailashahar, Ambassa, Teliamura, Sabroom, Sonamura, and 25+ more towns across Tripura.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-4xl font-bold mb-6 text-center">
              Complete Digital Restaurant Solution for Tripura
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Digital Menu QR Code System
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>AddMenu</strong> is the leading digital menu platform designed specifically for restaurants, cafes, and food businesses across <strong>Tripura</strong>. Whether you run a restaurant in <strong>Agartala</strong>, a cafe in <strong>Khowai</strong>, or a food joint in <strong>Belonia</strong>, AddMenu helps you create professional <strong>contactless QR code menus</strong> in minutes.
                </p>
                <p className="text-muted-foreground">
                  Our <strong>Basic Plan</strong> includes digital menu creation, QR code generation, analytics dashboard, customer feedback collection, and unlimited menu updates - perfect for small to medium restaurants in Tripura.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Online Ordering & Restaurant Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to <strong>AddMenu Premium</strong> for a complete restaurant management solution. Accept <strong>online food orders</strong>, integrate <strong>WhatsApp ordering</strong>, manage <strong>multiple locations</strong>, organize menu categories, and get advanced analytics - all in one platform.
                </p>
                <p className="text-muted-foreground">
                  Premium features include online ordering system, WhatsApp integration, multi-location support, menu organization, custom branding, and dedicated support - ideal for growing restaurants in Agartala and across Tripura.
                </p>
              </div>
            </div>

            <h3 className="text-3xl font-bold mt-12 mb-6 text-center">
              Serving Restaurants Across All Tripura Cities
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-4xl mx-auto">
              Our platform serves restaurants in all major cities and towns of Tripura including <strong>Agartala</strong>, <strong>Khowai</strong>, <strong>Belonia</strong>, <strong>Udaipur</strong>, <strong>Dharmanagar</strong>, <strong>Kailashahar</strong>, <strong>Ambassa</strong>, <strong>Teliamura</strong>, <strong>Sabroom</strong>, <strong>Sonamura</strong>, <strong>Bishalgarh</strong>, <strong>Kamalpur</strong>, <strong>Amarpur</strong>, <strong>Ranir Bazar</strong>, <strong>Santir Bazar</strong>, <strong>Melaghar</strong>, <strong>Jirania</strong>, <strong>Mohanpur</strong>, <strong>Kumarghat</strong>, <strong>Panisagar</strong>, <strong>Kanchanpur</strong>, <strong>Manu</strong>, <strong>Longtharai Valley</strong>, <strong>Dhalai</strong>, <strong>Gandacherra</strong>, <strong>Boxanagar</strong>, <strong>Dumburnagar</strong>, <strong>Fatikroy</strong>, <strong>Pecharthal</strong>, <strong>Kadamtala</strong>, <strong>Chailengta</strong>, <strong>Hrishyamukh</strong>, <strong>Radhakishorepur</strong>, and <strong>Takarjala</strong>.
            </p>

            <div className="bg-primary/5 rounded-lg p-8 mb-12">
              <h3 className="text-2xl font-bold mt-0 mb-4">
                How AddMenu Works for Tripura Restaurants
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">📱 Basic Features</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Upload menu photos or images</li>
                    <li>✓ Generate unique QR code instantly</li>
                    <li>✓ Download & print for tables</li>
                    <li>✓ Track daily menu views</li>
                    <li>✓ Collect customer feedback</li>
                    <li>✓ Update menu anytime</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">🚀 Premium Features</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Accept online food orders</li>
                    <li>✓ WhatsApp ordering integration</li>
                    <li>✓ Multi-location support</li>
                    <li>✓ Menu categories & organization</li>
                    <li>✓ Restaurant logo & branding</li>
                    <li>✓ Advanced analytics & reports</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mt-12 mb-4">
              Perfect for All Restaurant Types in Tripura
            </h3>
            <p className="text-muted-foreground mb-4">
              AddMenu works great for <strong>fine dining restaurants</strong>, <strong>casual cafes</strong>, <strong>street food vendors</strong>, <strong>cloud kitchens</strong>, <strong>bakeries</strong>, <strong>sweet shops</strong>, <strong>fast food chains</strong>, <strong>food courts</strong>, <strong>dhaba</strong>, <strong>biryani centers</strong>, <strong>Chinese restaurants</strong>, <strong>pizza outlets</strong>, <strong>burger joints</strong>, <strong>ice cream parlors</strong>, and all food businesses across Tripura.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">
              Why Choose AddMenu for Your Tripura Restaurant?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h4 className="font-bold mb-2">💰 Cost Effective</h4>
                <p className="text-sm text-muted-foreground">Save money on printing menus. Update prices instantly without reprinting.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h4 className="font-bold mb-2">🦠 Contactless & Safe</h4>
                <p className="text-sm text-muted-foreground">Perfect for post-pandemic dining. Customers scan QR with their phone.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h4 className="font-bold mb-2">📊 Data Insights</h4>
                <p className="text-sm text-muted-foreground">Track menu views, popular items, and customer preferences.</p>
              </div>
            </div>

            <p className="text-muted-foreground text-center text-lg">
              Join 100+ restaurants in Agartala, Khowai, Belonia, and across Tripura using AddMenu. Start your digital transformation today with our <strong>Basic Plan at ₹499/month</strong> or explore <strong>Premium features with custom pricing</strong> for complete restaurant management.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
