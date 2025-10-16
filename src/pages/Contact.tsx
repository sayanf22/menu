import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { Helmet } from "react-helmet";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/917005832798?text=${whatsappMessage}`, '_blank');
    toast.success("Redirecting to WhatsApp...");
  };

  return (
    <>
      <Helmet>
        <title>Contact AddMenu | Get in Touch for Digital Menu QR Code Solutions</title>
        <meta name="description" content="Contact AddMenu for digital menu solutions. Email: addmenu.in@gmail.com | Phone: +91 700-583-2798 | WhatsApp: +91 700-583-2798 | Serving all Tripura." />
        <meta name="keywords" content="contact addmenu, add menu contact, addmenu support, contact add menu, digital menu support, QR menu help, addmenu phone number, addmenu email" />
        <link rel="canonical" href="https://addmenu.in/contact" />
        <meta property="og:title" content="Contact AddMenu | Digital Menu Solutions" />
        <meta property="og:description" content="Get in touch with AddMenu for digital menu solutions. Available via email, phone, and WhatsApp." />
        <meta property="og:url" content="https://addmenu.in/contact" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
              <p className="text-xl text-muted-foreground">
                We're here to help! Reach out for any questions about AddMenu
              </p>
            </div>
          </section>

          <section className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div>
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Send Message via WhatsApp</Button>
                  </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                  
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Email</h3>
                        <a href="mailto:addmenu.in@gmail.com" className="text-muted-foreground hover:text-primary">
                          addmenu.in@gmail.com
                        </a>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Phone</h3>
                        <a href="tel:+917005832798" className="text-muted-foreground hover:text-primary">
                          +91 700-583-2798
                        </a>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <p className="text-muted-foreground">
                          Serving all of Tripura<br />
                          Agartala, Khowai, Belonia, Udaipur,<br />
                          Dharmanagar & 30+ more cities
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-primary/5">
                    <h3 className="font-semibold mb-3">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Sunday: 9:00 AM - 9:00 PM</p>
                    <p className="text-sm text-muted-foreground mt-2">We respond within 24 hours</p>
                  </Card>
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
