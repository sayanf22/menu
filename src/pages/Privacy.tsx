import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | AddMenu Digital Menu Services</title>
        <meta name="description" content="AddMenu Privacy Policy - Learn how we collect, use, and protect your data. GDPR compliant, secure data handling, and transparent privacy practices for digital menu services." />
        <meta name="keywords" content="addmenu privacy policy, addmenu data protection, add menu privacy, digital menu privacy, QR menu data security, addmenu GDPR, addmenu security" />
        <link rel="canonical" href="https://addmenu.in/privacy" />
        <meta property="og:title" content="Privacy Policy | AddMenu" />
        <meta property="og:description" content="Learn how AddMenu protects your data with industry-standard security and transparent privacy practices." />
        <meta property="og:url" content="https://addmenu.in/privacy" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-4xl prose prose-lg">
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: December 3, 2025</p>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg my-6">
              <p className="text-blue-800 m-0">
                At AddMenu, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
              </p>
            </div>

            <h2>1. Introduction</h2>
            <p>
              AddMenu ("we", "our", "us") operates the website <a href="https://addmenu.in">https://addmenu.in</a> and provides digital menu services. This Privacy Policy applies to all users of our website and services.
            </p>
            <p>
              By using our Service, you consent to the collection and use of information in accordance with this policy.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
              <li><strong>Business Information:</strong> Restaurant name, address, business type</li>
              <li><strong>Payment Information:</strong> Processed securely through Razorpay (we do not store card details)</li>
              <li><strong>Communication Data:</strong> Messages, feedback, and support requests</li>
            </ul>

            <h3>2.2 Menu Content</h3>
            <p>Information you upload to create your digital menu:</p>
            <ul>
              <li>Menu item names and descriptions</li>
              <li>Prices and categories</li>
              <li>Food images</li>
              <li>Restaurant logos and branding</li>
            </ul>

            <h3>2.3 Automatically Collected Information</h3>
            <p>When you use our Service, we automatically collect:</p>
            <ul>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
              <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
              <li><strong>Analytics Data:</strong> Menu views, QR code scans, customer interactions</li>
            </ul>

            <h3>2.4 Cookies and Tracking</h3>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve our Service</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li><strong>Provide Services:</strong> Create and host your digital menu, generate QR codes</li>
              <li><strong>Process Payments:</strong> Handle subscription payments through Razorpay</li>
              <li><strong>Communicate:</strong> Send service updates, respond to inquiries, provide support</li>
              <li><strong>Improve:</strong> Analyze usage to enhance features and user experience</li>
              <li><strong>Secure:</strong> Detect and prevent fraud, abuse, and security threats</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We do NOT sell, trade, or rent your personal information. We may share information only:</p>
            
            <h3>4.1 With Service Providers</h3>
            <ul>
              <li><strong>Razorpay:</strong> For payment processing</li>
              <li><strong>Supabase:</strong> For database and authentication services</li>
              <li><strong>Cloudflare:</strong> For content delivery and security</li>
              <li><strong>Analytics providers:</strong> For usage analysis (anonymized data)</li>
            </ul>

            <h3>4.2 For Legal Reasons</h3>
            <ul>
              <li>To comply with legal obligations</li>
              <li>To respond to lawful requests from authorities</li>
              <li>To protect our rights and safety</li>
              <li>To prevent fraud or illegal activities</li>
            </ul>

            <h3>4.3 With Your Consent</h3>
            <p>We may share information with third parties when you explicitly consent to such sharing.</p>

            <h2>5. Data Security</h2>
            <p>We implement robust security measures to protect your data:</p>
            <ul>
              <li><strong>Encryption:</strong> All data is encrypted in transit (SSL/TLS) and at rest</li>
              <li><strong>Secure Storage:</strong> Data stored on secure, access-controlled servers</li>
              <li><strong>Access Controls:</strong> Limited employee access on a need-to-know basis</li>
              <li><strong>Regular Audits:</strong> Periodic security assessments and updates</li>
              <li><strong>Payment Security:</strong> PCI-DSS compliant payment processing via Razorpay</li>
            </ul>

            <h2>6. Data Retention</h2>
            <p>We retain your information for:</p>
            <ul>
              <li><strong>Active Accounts:</strong> As long as your account is active</li>
              <li><strong>After Cancellation:</strong> 30 days for potential reactivation</li>
              <li><strong>Legal Requirements:</strong> As required by applicable laws (typically 7 years for financial records)</li>
              <li><strong>Anonymized Data:</strong> May be retained indefinitely for analytics</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
            </ul>
            <p>To exercise these rights, contact us at support@addmenu.in</p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>

            <h2>9. Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or website notice. The "Last updated" date at the top indicates when the policy was last revised.
            </p>

            <h2>12. Grievance Officer</h2>
            <p>
              In accordance with Information Technology Act 2000 and rules made thereunder, the Grievance Officer for the purpose of this Privacy Policy is:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="m-0"><strong>Name:</strong> AddMenu Support Team</p>
              <p className="m-0"><strong>Email:</strong> support@addmenu.in</p>
              <p className="m-0"><strong>Phone:</strong> +91 700-583-2798</p>
              <p className="m-0"><strong>Address:</strong> Tripura, India</p>
              <p className="m-0"><strong>Response Time:</strong> Within 24-48 hours</p>
            </div>

            <h2>13. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices:</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="m-0 mb-2"><strong>Company:</strong> AddMenu</p>
              <p className="m-0 mb-2"><strong>Website:</strong> <a href="https://addmenu.in">https://addmenu.in</a></p>
              <p className="m-0 mb-2"><strong>Email:</strong> support@addmenu.in</p>
              <p className="m-0 mb-2"><strong>Phone:</strong> +91 700-583-2798</p>
              <p className="m-0 mb-2"><strong>WhatsApp:</strong> +91 700-583-2798</p>
              <p className="m-0"><strong>Location:</strong> Tripura, India</p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Privacy;
