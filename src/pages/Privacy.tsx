import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>AddMenu Privacy Policy | Data Protection & Security</title>
        <meta name="description" content="AddMenu Privacy Policy - Learn how we protect your restaurant data and customer privacy. Secure digital menu solutions with industry-standard encryption." />
        <meta name="keywords" content="addmenu privacy policy, add menu privacy, addmenu data protection, digital menu privacy, restaurant data security, addmenu security" />
        <link rel="canonical" href="https://addmenu.in/privacy" />
        <meta property="og:title" content="AddMenu Privacy Policy" />
        <meta property="og:description" content="Learn how AddMenu protects your data and privacy with industry-standard security." />
        <meta property="og:url" content="https://addmenu.in/privacy" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-4xl prose prose-lg">
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: October 16, 2025</p>

            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Restaurant name and description</li>
              <li>Email address and contact information</li>
              <li>Menu images and content</li>
              <li>Customer feedback and ratings</li>
              <li>Usage analytics and statistics</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our digital menu services</li>
              <li>Process your account registration and authentication</li>
              <li>Generate QR codes for your restaurant</li>
              <li>Provide customer support</li>
              <li>Send important updates about our service</li>
              <li>Improve our platform and user experience</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information. Your data is stored securely using industry-standard encryption and security protocols.
            </p>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information only:
            </p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              Email: addmenu.in@gmail.com
              <br />
              Phone: +91 700-583-2798
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Privacy;
