import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Helmet } from "react-helmet";

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
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Custom Pricing for Your Restaurant
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We understand every restaurant is unique. That's why we offer personalized pricing based on your specific needs.
              </p>
            </div>
          </section>

          {/* Single Pricing Card */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-2xl">
              <Card className="p-12 text-center border-primary border-2 hover:shadow-2xl transition-shadow">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">Custom Pricing for Your Restaurant</h2>
                  <p className="text-lg text-muted-foreground">
                    Every restaurant is unique. We create a personalized pricing plan that fits your specific needs and budget.
                  </p>
                </div>

                <div className="mb-8">
                  <div className="text-5xl font-bold mb-2">Contact Us</div>
                  <p className="text-muted-foreground">For a personalized quote</p>
                </div>

                <div className="mb-8 text-left max-w-md mx-auto">
                  <h3 className="font-semibold mb-4 text-center">What's Included:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Digital menu creation & hosting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Professional QR code generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Real-time analytics & insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Customer feedback collection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Unlimited menu updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Social media integration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Dedicated customer support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Multi-language support</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => window.open('https://wa.me/917005832798?text=Hi%2C%20I%20want%20a%20pricing%20quote%20for%20AddMenu', '_blank')}>
                    WhatsApp Us
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => window.location.href = 'mailto:addmenu.in@gmail.com?subject=Pricing%20Inquiry'}>
                    Email Us
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          {/* Why Custom Pricing */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-center mb-12">Why Custom Pricing?</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3">Tailored to Your Needs</h3>
                  <p className="text-muted-foreground">
                    Every restaurant has different requirements. We assess your specific needs and provide pricing that makes sense for your business.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3">No Hidden Costs</h3>
                  <p className="text-muted-foreground">
                    Transparent pricing with no surprises. You'll know exactly what you're paying for before you commit.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3">Flexible Payment</h3>
                  <p className="text-muted-foreground">
                    Choose monthly or annual billing. We work with your budget and cash flow requirements.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-3">Scale as You Grow</h3>
                  <p className="text-muted-foreground">
                    Start small and upgrade as your restaurant grows. Our pricing scales with your success.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Contact us today for a personalized quote for your restaurant
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => window.open('https://wa.me/917005832798?text=Hi%2C%20I%20want%20a%20pricing%20quote%20for%20AddMenu', '_blank')}>
                  WhatsApp Us
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = 'mailto:addmenu.in@gmail.com?subject=Pricing%20Inquiry'}>
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
