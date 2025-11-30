import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  QrCode,
  BarChart3,
  Upload,
  Star,
  ArrowRight,
  Check,
  Smartphone,
  Zap,
  Shield,
  MessageCircle,
  Mail,
  Instagram,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />

      {/* Hero Section - Clean & Modern */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 100+ restaurants in Tripura</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Digital Menu &{" "}
              <span className="text-primary">QR Code</span>
              <br />
              <span className="text-muted-foreground font-normal text-2xl md:text-3xl lg:text-4xl mt-4 block">
                for Modern Restaurants
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create beautiful contactless menus in minutes. Let your customers
              scan, browse, and order with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 text-base rounded-full">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base rounded-full"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Social Links - Minimal Style */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <a
                href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/addmenu.in_"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@addmenu.in"
                className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Clean Steps */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your digital menu up and running in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload Menu",
                description:
                  "Take photos of your menu or upload existing images. We support multiple pages.",
              },
              {
                step: "02",
                icon: QrCode,
                title: "Get QR Code",
                description:
                  "Instantly generate a unique QR code. Download and print for your tables.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Track & Grow",
                description:
                  "Monitor views, collect feedback, and understand your customers better.",
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <Card className="p-8 h-full border-0 shadow-sm hover:shadow-md transition-shadow bg-background">
                  <div className="text-6xl font-bold text-primary/10 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for restaurants of all sizes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: QrCode,
                title: "QR Code Menu",
                description: "Instant QR codes for contactless dining",
              },
              {
                icon: Smartphone,
                title: "Mobile Optimized",
                description: "Perfect viewing on any device",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                description: "Track views and customer engagement",
              },
              {
                icon: Star,
                title: "Feedback",
                description: "Collect and manage customer reviews",
              },
              {
                icon: Zap,
                title: "Instant Updates",
                description: "Change menu items in real-time",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Your data is safe with us",
              },
              {
                icon: Upload,
                title: "Easy Upload",
                description: "Drag and drop menu images",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Orders",
                description: "Receive orders via WhatsApp",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-background"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "100+", label: "Active Restaurants" },
              { value: "10K+", label: "Menu Views/Month" },
              { value: "4.8★", label: "Average Rating" },
              { value: "35+", label: "Cities Covered" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your restaurant
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <p className="text-muted-foreground">
                  Perfect for small restaurants
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹499</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Digital Menu with QR Code",
                  "Upload Menu Images",
                  "Basic Analytics",
                  "Customer Feedback",
                  "Social Media Links",
                  "Unlimited Updates",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full h-12 rounded-full">
                  Get Started
                </Button>
              </Link>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 border-2 border-primary relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-muted-foreground">
                  Complete restaurant solution
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
                <span className="text-muted-foreground block text-sm mt-1">
                  Based on your needs
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Basic",
                  "Online Food Ordering",
                  "WhatsApp Integration",
                  "Multi-Location Support",
                  "Advanced Analytics",
                  "Custom Branding",
                  "Priority Support",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://menu-premium.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full h-12 rounded-full">
                  Explore Premium
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Restaurant Owners
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Rajesh Kumar",
                restaurant: "Spice Garden, Agartala",
                text: "AddMenu made it so easy to go digital. Our customers love scanning the QR code!",
              },
              {
                name: "Priya Sharma",
                restaurant: "Taste of Tripura, Khowai",
                text: "The analytics help us understand what dishes are popular. Setup took only 10 minutes!",
              },
              {
                name: "Amit Das",
                restaurant: "Cafe Delight, Belonia",
                text: "Cost-effective and professional. We saved money on printing menus.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.restaurant}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Serving All of Tripura
            </h2>
            <p className="text-lg text-muted-foreground">
              Available in 35+ cities and towns
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              "Agartala",
              "Khowai",
              "Belonia",
              "Udaipur",
              "Dharmanagar",
              "Kailashahar",
              "Ambassa",
              "Teliamura",
              "Sabroom",
              "Sonamura",
              "Bishalgarh",
              "Kamalpur",
            ].map((city, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-muted rounded-full text-sm font-medium"
              >
                {city}
              </span>
            ))}
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              +23 more cities
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Go Digital?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join 100+ restaurants in Tripura using AddMenu. Start your free
            trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 rounded-full"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://wa.me/917005832798?text=Hi%2C%20I%27m%20interested%20in%20AddMenu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full border-white/30 text-white hover:bg-white/10"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How much does AddMenu cost?",
                a: "Basic plan starts at ₹499/month. Premium plans have custom pricing based on your needs.",
              },
              {
                q: "Can I update my menu anytime?",
                a: "Yes! Update your menu, prices, and items anytime. Changes reflect instantly.",
              },
              {
                q: "Do I need technical knowledge?",
                a: "Not at all! Simply upload photos and you're done. We provide full support.",
              },
              {
                q: "Which cities do you serve?",
                a: "We serve all cities in Tripura including Agartala, Khowai, Belonia, and 30+ more.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6 border-0 shadow-sm">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
