import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About AddMenu | Leading Digital Menu QR Code Solution for Restaurants</title>
        <meta name="description" content="Learn about AddMenu - the #1 digital menu QR code solution for restaurants in Tripura. Serving 100+ restaurants in Agartala, Khowai, Belonia and 35+ cities." />
        <meta name="keywords" content="about addmenu, add menu about, digital menu company, QR menu Tripura, restaurant technology, addmenu team, about add menu, digital menu solution Tripura" />
        <link rel="canonical" href="https://addmenu.in/about" />
        <meta property="og:title" content="About AddMenu | Digital Menu Solutions" />
        <meta property="og:description" content="Learn about AddMenu - serving 100+ restaurants across Tripura with digital menu solutions." />
        <meta property="og:url" content="https://addmenu.in/about" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="container mx-auto max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">About AddMenu</h1>
              <p className="text-xl text-muted-foreground text-center mb-12">
                Transforming restaurants in Tripura with digital menu solutions
              </p>
              
              <Card className="p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  AddMenu is dedicated to helping restaurants across Tripura modernize their dining experience through innovative digital menu solutions. We believe every restaurant, from small cafes in Khowai to fine dining establishments in Agartala, deserves access to professional, contactless menu technology.
                </p>
                <p className="text-muted-foreground">
                  Our mission is to make digital transformation accessible and affordable for all restaurants in Tripura, helping them serve customers better while reducing costs and improving efficiency.
                </p>
              </Card>

              <Card className="p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">Why We Started</h2>
                <p className="text-muted-foreground mb-4">
                  During the pandemic, we saw restaurants struggling with traditional paper menus. The need for contactless, hygienic solutions became critical. We created AddMenu to solve this problem for restaurants in Tripura.
                </p>
                <p className="text-muted-foreground">
                  Today, we're proud to serve 100+ restaurants across 35+ cities in Tripura, from Agartala to Belonia, Udaipur to Dharmanagar, helping them provide safer, more efficient dining experiences.
                </p>
              </Card>

              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li>✓ Easy-to-use digital menu creation</li>
                  <li>✓ Professional QR code generation</li>
                  <li>✓ Real-time analytics and insights</li>
                  <li>✓ Customer feedback collection</li>
                  <li>✓ Instant menu updates</li>
                  <li>✓ Multi-language support</li>
                  <li>✓ Dedicated customer support</li>
                  <li>✓ Custom pricing for every budget</li>
                </ul>
              </Card>
            </div>
          </section>

          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-6">Serving All of Tripura</h2>
              <p className="text-muted-foreground mb-8">
                We're proud to support restaurants in Agartala, Khowai, Belonia, Udaipur, Dharmanagar, Kailashahar, Ambassa, Teliamura, Sabroom, Sonamura, Bishalgarh, Kamalpur, Amarpur, and 25+ more cities across Tripura.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4"><p className="font-semibold">100+</p><p className="text-sm text-muted-foreground">Restaurants</p></Card>
                <Card className="p-4"><p className="font-semibold">35+</p><p className="text-sm text-muted-foreground">Cities</p></Card>
                <Card className="p-4"><p className="font-semibold">10K+</p><p className="text-sm text-muted-foreground">Menu Views</p></Card>
                <Card className="p-4"><p className="font-semibold">4.8★</p><p className="text-sm text-muted-foreground">Rating</p></Card>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;
