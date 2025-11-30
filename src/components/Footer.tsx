import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t py-12 bg-muted/10 relative overflow-hidden dark:bg-muted/5">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 dark:bg-primary/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 dark:bg-accent/3" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/favicon.png" 
                alt="AddMenu Logo" 
                className="w-10 h-10 object-contain"
              />
              <h3 className="font-bold text-lg">AddMenu</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Digital menu QR code solution for restaurants in Tripura
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <a href="https://addmenu.in" className="hover:text-primary transition-colors duration-300">
                www.addmenu.in
              </a>
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors duration-300 inline-block hover:translate-x-1 transform">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary transition-colors duration-300 inline-block hover:translate-x-1 transform">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors duration-300 inline-block hover:translate-x-1 transform">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors duration-300 inline-block hover:translate-x-1 transform">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors duration-300 inline-block hover:translate-x-1 transform">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors duration-300 inline-block hover:translate-x-1 transform">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-primary transition-colors duration-300 inline-block hover:translate-x-1 transform">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Serving all of Tripura</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@addmenu.in" className="hover:text-primary transition-colors duration-300">
                  support@addmenu.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+917005832798" className="hover:text-primary transition-colors duration-300">
                  +91 700-583-2798
                </a>
              </div>
              {/* Minimal outline social icons */}
              <div className="flex gap-3 pt-2">
                <a 
                  href="https://wa.me/917005832798" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="Contact us on WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/addmenu.in_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a 
                  href="mailto:support@addmenu.in"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="Email us"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AddMenu. All rights reserved. | Digital Menu Solution for Tripura Restaurants</p>
        </div>
      </div>
    </footer>
  );
};
