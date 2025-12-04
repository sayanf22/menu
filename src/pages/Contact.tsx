import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Helmet } from "react-helmet";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0ASubject: ${formData.subject}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/917005832798?text=${whatsappMessage}`, '_blank');
    toast.success("Redirecting to WhatsApp...");
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | AddMenu Digital Menu Support</title>
        <meta name="description" content="Contact AddMenu for digital menu solutions. Email: support@addmenu.in | Phone: +91 700-583-2798 | WhatsApp support available. Quick response within 24 hours." />
        <meta name="keywords" content="contact addmenu, addmenu support, addmenu phone number, addmenu email, digital menu help, QR menu support, addmenu customer service, addmenu whatsapp" />
        <link rel="canonical" href="https://addmenu.in/contact" />
        <meta property="og:title" content="Contact Us | AddMenu Support" />
        <meta property="og:description" content="Get in touch with AddMenu for digital menu solutions. Available via email, phone, and WhatsApp." />
        <meta property="og:url" content="https://addmenu.in/contact" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
              <p className="text-xl text-muted-foreground">
                We're here to help! Reach out for any questions about AddMenu digital menu services
              </p>
            </div>
          </section>

          <section className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us how we can help you..."
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Send Message via WhatsApp
                    </Button>
                  </form>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                  
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Email</h3>
                        <a href="mailto:support@addmenu.in" className="text-muted-foreground hover:text-primary">
                          support@addmenu.in
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">We respond within 24 hours</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Phone & WhatsApp</h3>
                        <a href="tel:+917005832798" className="text-muted-foreground hover:text-primary block">
                          +91 700-583-2798
                        </a>
                        <a href="https://wa.me/917005832798" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <p className="text-muted-foreground">Tripura, India</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Serving Agartala, Khowai, Belonia, Udaipur, Dharmanagar & 30+ cities
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <Clock className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Business Hours</h3>
                        <p className="text-muted-foreground">Monday - Sunday: 9:00 AM - 9:00 PM IST</p>
                        <p className="text-sm text-muted-foreground mt-2">WhatsApp monitored 24/7</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="font-semibold mb-3">Quick Support Tips</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• For billing: include your registered email</li>
                      <li>• For technical issues: describe the problem in detail</li>
                      <li>• For refunds: mention your payment date</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold mb-8 text-center">Company Information</h2>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Registered Name</h3>
                    <p className="text-muted-foreground">AddMenu</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Website</h3>
                    <a href="https://addmenu.in" className="text-primary hover:underline">https://addmenu.in</a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Support Email</h3>
                    <a href="mailto:support@addmenu.in" className="text-primary hover:underline">support@addmenu.in</a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Number</h3>
                    <a href="tel:+917005832798" className="text-primary hover:underline">+91 700-583-2798</a>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-2">Address</h3>
                    <p className="text-muted-foreground">Tripura, India</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Contact;
