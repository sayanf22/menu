import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export const SEO = ({
  title = "AddMenu - Digital Menu QR Code for Restaurants in Tripura | Agartala, Khowai, Belonia",
  description = "AddMenu - Best digital menu QR code solution for restaurants in Tripura. Serve customers in Agartala, Khowai, Belonia, Udaipur, Dharmanagar. Free QR menu maker with analytics & feedback.",
  keywords = "AddMenu, digital menu Tripura, QR code menu Agartala, restaurant menu Tripura, digital menu Khowai, QR menu Belonia, contactless menu Tripura, restaurant QR code Agartala",
  ogImage = "https://addmenu.in/favicon.png",
  canonical
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = `https://menu-hue-scan-main-cvf.pages.dev${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: currentUrl },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || currentUrl);

  }, [title, description, keywords, ogImage, currentUrl, canonical]);

  return null;
};
