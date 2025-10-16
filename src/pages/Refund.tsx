import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Refund = () => {
  return (
    <>
      <Helmet>
        <title>AddMenu Refund Policy | Money-Back Guarantee & Cancellation</title>
        <meta name="description" content="AddMenu Refund Policy - 7-day money-back guarantee. Learn about our refund and cancellation policy for digital menu services. Fair and transparent." />
        <meta name="keywords" content="addmenu refund, add menu refund policy, addmenu cancellation, digital menu refund, restaurant menu refund, addmenu money back" />
        <link rel="canonical" href="https://addmenu.in/refund" />
        <meta property="og:title" content="AddMenu Refund Policy" />
        <meta property="og:description" content="7-day money-back guarantee. Learn about AddMenu's fair refund and cancellation policy." />
        <meta property="og:url" content="https://addmenu.in/refund" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-4xl prose prose-lg">
            <h1>Refund Policy</h1>
            <p className="text-muted-foreground">Last updated: October 16, 2025</p>

            <h2>1. Refund Eligibility</h2>
            <p>
              We want you to be completely satisfied with AddMenu. You may request a refund within 7 days of your initial payment if:
            </p>
            <ul>
              <li>The service does not work as described</li>
              <li>You experience technical issues we cannot resolve</li>
              <li>You are not satisfied with the service quality</li>
            </ul>

            <h2>2. Non-Refundable Items</h2>
            <p>The following are not eligible for refunds:</p>
            <ul>
              <li>Services used for more than 7 days</li>
              <li>Custom development work already completed</li>
              <li>Setup fees after account activation</li>
              <li>Renewal payments (must cancel before renewal date)</li>
            </ul>

            <h2>3. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ol>
              <li>Contact us within 7 days of payment</li>
              <li>Provide your account details and reason for refund</li>
              <li>We will review your request within 2-3 business days</li>
              <li>Approved refunds are processed within 5-7 business days</li>
            </ol>

            <h2>4. Cancellation Policy</h2>
            <p>
              You may cancel your subscription at any time. Upon cancellation:
            </p>
            <ul>
              <li>You will have access until the end of your billing period</li>
              <li>No refund for the current billing period</li>
              <li>Your data will be retained for 30 days</li>
              <li>You can reactivate within 30 days without data loss</li>
            </ul>

            <h2>5. Refund Method</h2>
            <p>
              Refunds will be issued to the original payment method used for purchase. Processing time depends on your payment provider.
            </p>

            <h2>6. Partial Refunds</h2>
            <p>
              In some cases, we may offer partial refunds for:
            </p>
            <ul>
              <li>Downgrading to a lower plan</li>
              <li>Service disruptions beyond our control</li>
              <li>Pro-rated refunds for annual plans</li>
            </ul>

            <h2>7. Dispute Resolution</h2>
            <p>
              If you're not satisfied with our refund decision, please contact us to discuss. We're committed to finding a fair solution.
            </p>

            <h2>8. Contact for Refunds</h2>
            <p>
              To request a refund or ask questions:
              <br />
              Email: addmenu.in@gmail.com
              <br />
              Phone: +91 700-583-2798
              <br />
              WhatsApp: +91 700-583-2798
            </p>

            <h2>9. Changes to Policy</h2>
            <p>
              We reserve the right to modify this refund policy. Changes will be posted on this page with an updated date.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Refund;
