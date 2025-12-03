import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Shipping = () => {
  return (
    <>
      <Helmet>
        <title>Shipping & Delivery Policy | AddMenu Digital Menu Services</title>
        <meta name="description" content="AddMenu Shipping & Delivery Policy - Instant digital delivery of QR code menu services. No physical shipping required. Immediate access upon subscription." />
        <meta name="keywords" content="addmenu shipping, addmenu delivery, digital menu delivery, QR code delivery, addmenu service delivery, instant delivery" />
        <link rel="canonical" href="https://addmenu.in/shipping" />
        <meta property="og:title" content="Shipping & Delivery Policy | AddMenu" />
        <meta property="og:description" content="Instant digital delivery of QR code menu services. No physical shipping required." />
        <meta property="og:url" content="https://addmenu.in/shipping" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-4xl prose prose-lg">
            <h1>Shipping & Delivery Policy</h1>
            <p className="text-muted-foreground">Last updated: December 3, 2025</p>

            <div className="bg-primary/5 p-6 rounded-lg my-6">
              <p className="font-semibold text-lg mb-2">Digital Service - No Physical Shipping</p>
              <p className="text-muted-foreground m-0">
                AddMenu is a 100% digital service. All our products and services are delivered electronically. 
                No physical goods are shipped.
              </p>
            </div>

            <h2>1. Nature of Service</h2>
            <p>
              AddMenu provides digital menu solutions including:
            </p>
            <ul>
              <li>Digital menu creation and hosting platform</li>
              <li>QR code generation for restaurant menus</li>
              <li>Online dashboard access for menu management</li>
              <li>Analytics and reporting tools</li>
              <li>Customer feedback collection system</li>
            </ul>

            <h2>2. Digital Delivery Timeline</h2>
            <p>
              Upon successful payment and account creation, you will receive:
            </p>
            <table className="w-full border-collapse border border-gray-300 my-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Service</th>
                  <th className="border border-gray-300 p-3 text-left">Delivery Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3">Account Access</td>
                  <td className="border border-gray-300 p-3">Instant (within seconds)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">Dashboard Access</td>
                  <td className="border border-gray-300 p-3">Instant (within seconds)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">QR Code Generation</td>
                  <td className="border border-gray-300 p-3">Instant (within seconds)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">Menu Setup Assistance</td>
                  <td className="border border-gray-300 p-3">Within 24 hours</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">Custom Support</td>
                  <td className="border border-gray-300 p-3">Within 24-48 hours</td>
                </tr>
              </tbody>
            </table>

            <h2>3. Access Credentials</h2>
            <p>
              After successful payment:
            </p>
            <ul>
              <li>Login credentials are sent to your registered email address</li>
              <li>You can immediately access your dashboard at addmenu.in</li>
              <li>QR codes can be downloaded instantly from your dashboard</li>
              <li>All features are available immediately based on your subscription plan</li>
            </ul>

            <h2>4. Service Activation</h2>
            <p>
              Your AddMenu subscription is activated automatically upon:
            </p>
            <ol>
              <li>Successful payment confirmation from Razorpay</li>
              <li>Account verification (if required)</li>
              <li>Email confirmation sent to your registered email</li>
            </ol>

            <h2>5. Technical Requirements</h2>
            <p>
              To access AddMenu services, you need:
            </p>
            <ul>
              <li>A device with internet connection (computer, tablet, or smartphone)</li>
              <li>A modern web browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Valid email address for account communications</li>
            </ul>

            <h2>6. Delivery Issues</h2>
            <p>
              If you face any issues accessing your service after payment:
            </p>
            <ul>
              <li>Check your email spam/junk folder for login credentials</li>
              <li>Ensure you're using the correct email address</li>
              <li>Clear your browser cache and try again</li>
              <li>Contact our support team immediately</li>
            </ul>

            <h2>7. No Physical Shipping</h2>
            <p>
              Please note that AddMenu does not:
            </p>
            <ul>
              <li>Ship any physical products</li>
              <li>Deliver printed QR codes or materials</li>
              <li>Send any physical merchandise</li>
            </ul>
            <p>
              All QR codes and materials can be downloaded digitally and printed locally by the customer if needed.
            </p>

            <h2>8. Service Availability</h2>
            <p>
              AddMenu services are available:
            </p>
            <ul>
              <li>24 hours a day, 7 days a week</li>
              <li>Across all regions in India</li>
              <li>On any device with internet access</li>
            </ul>

            <h2>9. Contact for Delivery Issues</h2>
            <p>
              If you haven't received access to your services within the expected timeframe, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="m-0"><strong>Email:</strong> support@addmenu.in</p>
              <p className="m-0"><strong>Phone:</strong> +91 700-583-2798</p>
              <p className="m-0"><strong>WhatsApp:</strong> +91 700-583-2798</p>
              <p className="m-0"><strong>Business Hours:</strong> Monday - Sunday, 9:00 AM - 9:00 PM IST</p>
            </div>

            <h2>10. Policy Updates</h2>
            <p>
              This Shipping & Delivery Policy may be updated from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Shipping;
