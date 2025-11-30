import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, ArrowRight, MessageCircle, Mail, Sparkles, Star, Zap, Shield, Users } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

// Unused imports kept for potential future use

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>AddMenu Pricing | Custom Digital Menu QR Code Pricing for Restaurants</title>
        <meta name="description" content="Get custom pricing for AddMenu digital menu solutions. Affordable QR code menus for restaurants in Tripura. Contact us for a personalized quote today!" />
        <meta name="keywords" content="addmenu pricing, add menu pricing, digital menu pricing, QR menu cost, restaurant menu pricing, addmenu cost, menu QR code pricing, digital menu Tripura pricing, contactless menu pricing" />
        <link rel="canonical" href="https://addmenu.in/pricing" />
        <meta property="og:title" content="AddMenu Pricing | Custom Digital Menu Solutions" />
        <meta property="og:description" content="Get custom pricing for AddMenu digital menu solutions. Contact us for a personalized quote." />
        <meta property="og:url" content="https://addmenu.in/pricing" />
        <meta name="twitter:title" content="AddMenu Pricing | Custom Digital Menu Solutions" />
        <meta name="twitter:description" content="Get custom pricing for AddMenu digital menu solutions. Contact us for a personalized quote." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 dark:from-primary/5 dark:to-accent/3" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 dark:from-accent/5 dark:to-primary/3" />
            </div>
            
            {/* Decorative shapes */}
            <div className="absolute top-20 left-[10%] w-16 h-16 border-2 border-primary/15 rounded-full dark:border-primary/10" />
            <div className="absolute top-40 right-[15%] w-24 h-24 border-2 border-accent/10 rounded-full dark:border-accent/5" />
            <div className="absolute bottom-20 left-[20%] w-12 h-12 bg-primary/5 rounded-full dark:bg-primary/3" />
            
            <div className="container mx-auto max-w-4xl text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 dark:bg-primary/15">
                <Sparkles className="w-4 h-4" />
                Simple & Transparent
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Choose the Perfect <span className="text-primary">Plan</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start with our Basic plan or go Premium for advanced features. No hidden fees, cancel anytime.
              </p>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="py-16 px-4 relative">
            <div className="container mx-auto max-w-5xl">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Basic Plan */}
                <Card className="p-8 border-2 border-border hover:border-primary/30 transition-all duration-300 relative overflow-hidden dark:border-border/50 dark:hover:border-primary/40 rounded-3xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 dark:bg-primary/3" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center dark:bg-primary/15">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Basic</h3>
                        <p className="text-sm text-muted-foreground">For small restaurants</p>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold">₹499</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Billed monthly</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      {[
                        "Digital Menu with QR Code",
                        "Upload Menu Images",
                        "Basic Analytics Dashboard",
                        "Customer Feedback Collection",
                        "Social Media Links",
                        "Unlimited Menu Updates",
                        "Email Support",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 dark:bg-green-500/20">
                            <Check className="w-3 h-3 text-green-500" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link to="/auth" className="block">
                      <Button className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Premium Plan */}
                <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden dark:from-primary/10 dark:to-accent/10 rounded-3xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  {/* Popular badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg">
                      <Crown className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                  
                  <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 dark:bg-primary/5" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Premium</h3>
                        <p className="text-sm text-muted-foreground">For growing businesses</p>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold">Custom</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Contact us for pricing</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      {[
                        "Everything in Basic",
                        "Online Food Ordering System",
                        "WhatsApp Order Integration",
                        "Multi-Location Support",
                        "Advanced Analytics & Reports",
                        "Menu Categories & Organization",
                        "Restaurant Logo & Branding",
                        "Custom Branding & White Label",
                        "Priority 24/7 Support",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 dark:bg-primary/20">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <a href="https://www.addmenu.site" target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full rounded-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl">
                        Explore Premium
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Feature Comparison */}
          <section className="py-16 px-4 bg-muted/30 relative overflow-hidden dark:bg-muted/10">
            {/* Background shapes */}
            <div className="absolute top-10 right-[5%] w-24 h-24 border-2 border-primary/10 rounded-full dark:border-primary/5" />
            <div className="absolute bottom-10 left-[8%] w-16 h-16 bg-accent/5 rounded-full dark:bg-accent/3" />
            
            <div className="container mx-auto max-w-4xl relative z-10">
              <h2 className="text-3xl font-bold text-center mb-12">
                Compare <span className="text-primary">Features</span>
              </h2>
              
              <div className="bg-card rounded-3xl border overflow-hidden dark:bg-card/50">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 font-semibold dark:bg-muted/30">
                  <div>Feature</div>
                  <div className="text-center">Basic</div>
                  <div className="text-center text-primary">Premium</div>
                </div>
                
                {[
                  { feature: "Digital QR Menu", basic: true, premium: true },
                  { feature: "Menu Image Upload", basic: true, premium: true },
                  { feature: "Basic Analytics", basic: true, premium: true },
                  { feature: "Customer Feedback", basic: true, premium: true },
                  { feature: "Social Media Links", basic: true, premium: true },
                  { feature: "Unlimited Updates", basic: true, premium: true },
                  { feature: "Online Ordering", basic: false, premium: true },
                  { feature: "WhatsApp Integration", basic: false, premium: true },
                  { feature: "Multi-Location", basic: false, premium: true },
                  { feature: "Advanced Analytics", basic: false, premium: true },
                  { feature: "Custom Branding", basic: false, premium: true },
                  { feature: "Priority Support", basic: false, premium: true },
                ].map((row, i) => (
                  <div key={i} className={`grid grid-cols-3 gap-4 p-4 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'} dark:${i % 2 === 0 ? 'bg-background/50' : 'bg-muted/10'}`}>
                    <div className="text-sm">{row.feature}</div>
                    <div className="text-center">
                      {row.basic ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="text-center">
                      {row.premium ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-16 px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-20 left-[5%] w-20 h-20 border-2 border-primary/10 rounded-full dark:border-primary/5" />
            <div className="absolute bottom-20 right-[10%] w-16 h-16 bg-accent/5 rounded-full dark:bg-accent/3" />
            
            <div className="container mx-auto max-w-5xl relative z-10">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Choose <span className="text-primary">AddMenu</span>?
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Zap, title: "Quick Setup", desc: "Get started in under 5 minutes" },
                  { icon: Shield, title: "Secure & Reliable", desc: "99.9% uptime guaranteed" },
                  { icon: Users, title: "Local Support", desc: "Dedicated support in Tripura" },
                  { icon: Star, title: "No Hidden Fees", desc: "Transparent pricing always" },
                ].map((item, i) => (
                  <Card key={i} className="p-6 text-center hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30 dark:border-primary/20 dark:hover:border-primary/40 rounded-2xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer group">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center dark:bg-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 px-4 mx-4 bg-gradient-to-r from-primary to-accent relative overflow-hidden rounded-3xl my-8">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-[10%] w-20 h-20 border-2 border-white rounded-full" />
              <div className="absolute bottom-10 right-[15%] w-16 h-16 border-2 border-white rounded-full" />
            </div>
            
            <div className="container mx-auto max-w-2xl text-center relative z-10">
              <h2 className="text-3xl font-bold mb-6 text-white">Ready to Get Started?</h2>
              <p className="text-xl text-white/80 mb-8">
                Contact us today for a personalized quote for your restaurant
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full bg-white text-primary hover:bg-white/90 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl"
                  onClick={() => window.open('https://wa.me/917005832798?text=Hi%2C%20I%20want%20a%20pricing%20quote%20for%20AddMenu', '_blank')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 rounded-full border-2 border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                  onClick={() => window.location.href = 'mailto:support@addmenu.in?subject=Pricing%20Inquiry'}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </Button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
