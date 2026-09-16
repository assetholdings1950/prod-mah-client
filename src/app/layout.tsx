import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import Script from "next/script";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import AppChrome from "@/components/AppChrome";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const GOOGLE_ADS_ID = "AW-17570767107";
const TAWK_TO_WIDGET_URL =
  "https://embed.tawk.to/6a917570f6e1fc34483870ec/1k1435glh";

export const metadata: Metadata = {
  metadataBase: new URL("https://merlionassetholdings.com"),
  title: "Merlion Asset Holdings | Global Investment Management",
  description:
    "Merlion Asset Holdings is a Singapore-headquartered investment institution with a global presence across the UAE, Canada, Russia, the United Kingdom, and India.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Merlion Asset Holdings",
  url: "https://merlionassetholdings.com",
  description:
    "A Singapore-headquartered investment institution with a global presence across the United Arab Emirates, Canada, Russia, the United Kingdom, and India.",
  areaServed: [
    "Singapore",
    "United Arab Emirates",
    "Canada",
    "Russia",
    "United Kingdom",
    "India",
  ].map((name) => ({ "@type": "Country", name })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${libreBaskerville.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* Google Ads base tag */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);
              t.async=1;
              t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];
              y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "y7u7xqpjmh");
          `}
        </Script>

        {/* Tawk.to live chat (disabled) */}
        {/*
        <Script id="tawk-to-widget" strategy="afterInteractive">
          {`
            window.Tawk_API = window.Tawk_API || {};
            window.Tawk_LoadStart = new Date();

            (function() {
              var s1 = document.createElement("script");
              var s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = "${TAWK_TO_WIDGET_URL}";
              s1.charset = "UTF-8";
              s1.setAttribute("crossorigin", "*");
              s0.parentNode.insertBefore(s1, s0);
            })();
          `}
        </Script>
        */}

        <SmoothScrollProvider>
          <AppChrome>{children}</AppChrome>
        </SmoothScrollProvider>

        <Toaster />
      </body>
    </html>
  );
}
