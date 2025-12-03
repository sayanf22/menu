import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | AddMenu Digital Menu Services</title>
        <meta name="description" content="AddMenu Terms and Conditions - Complete service agreement for digital menu QR code platform. User responsibilities, payment terms, and service guidelines." />
        <meta name="keywords" content="addmenu terms, addmenu conditions, add menu terms of service, digital menu agreement, QR menu terms, addmenu user agreement, addmenu service terms" />
        <link rel="canonical" href="https://addmenu.in/terms" />
        <meta property="og:title" content="Terms and Conditions | AddMenu" />
        <meta property="og:description" content="Complete terms and conditions for using AddMenu digital menu services." />
        <meta property="og:url" content="https://addmenu.in/terms" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-4xl prose prose-lg">
            <h1>Terms and Conditions</h1>
            <p className="text-muted-foreground">Last updated: December 3, 2025</p>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg my-6">
              <p className="text-blue-800 m-0">
                Please read these Terms and Conditions carefully before using AddMenu services. 
                By accessing or using our service, you agree to be bound by these terms.
              </p>
            </div>

            <h2>1. Introduction</h2>
            <p>
              Welcome to AddMenu ("Company", "we", "our", "us"). These Terms and Conditions ("Terms") govern your use of our website located at <a href="https://addmenu.in">https://addmenu.in</a> and our digital menu services (collectively, the "Service").
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>

            <h2>2. Definitions</h2>
            <ul>
              <li><strong>"Service"</strong> refers to the AddMenu website and digital menu platform</li>
              <li><strong>"User"</strong> refers to any individual or entity using our Service</li>
              <li><strong>"Subscriber"</strong> refers to Users with paid subscriptions</li>
              <li><strong>"Content"</strong> refers to menu items, images, text, and other materials uploaded by Users</li>
              <li><strong>"QR Code"</strong> refers to the scannable codes generated for accessing digital menus</li>
            </ul>

            <h2>3. Service Description</h2>
            <p>AddMenu provides:</p>
            <ul>
              <li>Digital menu creation and hosting platform</li>
              <li>QR code generation for restaurant menus</li>
              <li>Menu management dashboard</li>
              <li>Analytics and customer feedback tools</li>
              <li>Customer support services</li>
            </ul>

            <h2>4. Account Registration</h2>
            <h3>4.1 Eligibility</h3>
            <p>To use our Service, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Provide accurate and complete registration information</li>
              <li>Be authorized to represent the business (if registering on behalf of a business)</li>
            </ul>

            <h3>4.2 Account Responsibilities</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Keeping your contact information up to date</li>
            </ul>

            <h2>5. Payment Terms</h2>
            <h3>5.1 Pricing</h3>
            <ul>
              <li>All prices are displayed in Indian Rupees (INR)</li>
              <li>Prices are inclusive of applicable taxes unless stated otherwise</li>
              <li>We reserve the right to change prices with prior notice</li>
            </ul>

            <h3>5.2 Payment Methods</h3>
            <p>We accept payments through Razorpay, including:</p>
            <ul>
              <li>Credit Cards (Visa, MasterCard, American Express)</li>
              <li>Debit Cards</li>
              <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
              <li>Net Banking</li>
              <li>Digital Wallets</li>
            </ul>

            <h3>5.3 Billing</h3>
            <ul>
              <li>Subscriptions are billed in advance</li>
              <li>Monthly subscriptions renew automatically each month</li>
              <li>Annual subscriptions renew automatically each year</li>
              <li>You will receive email notifications before renewal</li>
            </ul>

            <h2>6. User Content</h2>
            <h3>6.1 Ownership</h3>
            <p>
              You retain all ownership rights to the content you upload to AddMenu, including menu items, images, descriptions, and restaurant information.
            </p>

            <h3>6.2 License Grant</h3>
            <p>
              By uploading content, you grant AddMenu a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content solely for the purpose of providing our Service.
            </p>

            <h3>6.3 Content Guidelines</h3>
            <p>You agree not to upload content that:</p>
            <ul>
              <li>Infringes on intellectual property rights</li>
              <li>Contains false or misleading information</li>
              <li>Is offensive, defamatory, or inappropriate</li>
              <li>Violates any applicable laws or regulations</li>
              <li>Contains malware or harmful code</li>
            </ul>

            <h2>7. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use automated systems to access the Service</li>
              <li>Impersonate another person or entity</li>
              <li>Upload viruses or malicious code</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
              The AddMenu name, logo, website design, and all related intellectual property are owned by AddMenu. You may not use our trademarks without prior written consent.
            </p>

            <h2>9. Service Availability</h2>
            <ul>
              <li>We strive to maintain 99.9% uptime</li>
              <li>We may perform scheduled maintenance with prior notice</li>
              <li>We are not liable for downtime due to factors beyond our control</li>
              <li>We reserve the right to modify or discontinue features</li>
            </ul>

            <h2>10. Termination</h2>
            <h3>10.1 By User</h3>
            <p>You may terminate your account at any time by contacting us or through your dashboard settings.</p>

            <h3>10.2 By AddMenu</h3>
            <p>We may suspend or terminate your account if you:</p>
            <ul>
              <li>Violate these Terms and Conditions</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent activity</li>
              <li>Abuse our Service or support team</li>
            </ul>

            <h2>11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, AddMenu shall not be liable for:
            </p>
            <ul>
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages arising from service interruptions</li>
              <li>Third-party actions or content</li>
            </ul>
            <p>
              Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless AddMenu, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2>13. Privacy</h2>
            <p>
              Your use of the Service is also governed by our <a href="/privacy">Privacy Policy</a>. Please review it to understand how we collect, use, and protect your information.
            </p>

            <h2>14. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms shall be:
            </p>
            <ul>
              <li>First attempted to be resolved through good-faith negotiation</li>
              <li>Subject to the exclusive jurisdiction of courts in Tripura, India</li>
              <li>Governed by the laws of India</li>
            </ul>

            <h2>15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or website notice. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h2>17. Contact Information</h2>
            <p>For questions about these Terms and Conditions:</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="m-0 mb-2"><strong>Company:</strong> AddMenu</p>
              <p className="m-0 mb-2"><strong>Website:</strong> <a href="https://addmenu.in">https://addmenu.in</a></p>
              <p className="m-0 mb-2"><strong>Email:</strong> support@addmenu.in</p>
              <p className="m-0 mb-2"><strong>Phone:</strong> +91 700-583-2798</p>
              <p className="m-0 mb-2"><strong>WhatsApp:</strong> +91 700-583-2798</p>
              <p className="m-0"><strong>Location:</strong> Tripura, India</p>
            </div>

            <h2>18. Acknowledgment</h2>
            <p>
              By using AddMenu, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Terms;
