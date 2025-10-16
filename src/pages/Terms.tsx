import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>AddMenu Terms of Service | Service Agreement & Conditions</title>
        <meta name="description" content="AddMenu Terms of Service - Read our terms and conditions for using our digital menu QR code platform. Clear, fair terms for restaurant owners." />
        <meta name="keywords" content="addmenu terms, add menu terms of service, addmenu conditions, digital menu terms, restaurant menu terms, addmenu agreement" />
        <link rel="canonical" href="https://addmenu.in/terms" />
        <meta property="og:title" content="AddMenu Terms of Service" />
        <meta property="og:description" content="Read AddMenu's terms and conditions for our digital menu services." />
        <meta property="og:url" content="https://addmenu.in/terms" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-4xl prose prose-lg">
            <h1>Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: October 16, 2025</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using AddMenu's services, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>

            <h2>2. Service Description</h2>
            <p>
              AddMenu provides digital menu QR code solutions for restaurants, including:
            </p>
            <ul>
              <li>Digital menu creation and hosting</li>
              <li>QR code generation</li>
              <li>Analytics and reporting</li>
              <li>Customer feedback collection</li>
            </ul>

            <h2>3. Account Registration</h2>
            <p>
              To use our services, you must:
            </p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h2>4. Pricing and Payment</h2>
            <p>
              AddMenu offers custom pricing based on your restaurant's needs. Payment terms will be agreed upon before service activation. All fees are non-refundable unless otherwise stated in our Refund Policy.
            </p>

            <h2>5. Content Ownership</h2>
            <p>
              You retain all rights to your menu content, images, and restaurant information. By using our service, you grant us a license to display and distribute your content as necessary to provide our services.
            </p>

            <h2>6. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any illegal purpose</li>
              <li>Upload offensive or inappropriate content</li>
              <li>Attempt to hack or disrupt our services</li>
              <li>Resell or redistribute our services</li>
            </ul>

            <h2>7. Service Availability</h2>
            <p>
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance that temporarily affects availability.
            </p>

            <h2>8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account for violation of these terms or non-payment.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              AddMenu shall not be liable for any indirect, incidental, or consequential damages arising from use of our services.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use of our services constitutes acceptance of updated terms.
            </p>

            <h2>11. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
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

export default Terms;
