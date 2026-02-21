import '../styles/globals.css';
import { DefaultSeo } from 'next-seo';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CookieConsent from 'react-cookie-consent';
import Layout from '../components/Layout';

const NO_NAVBAR_ROUTES = ['/login', '/signup'];

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const hideNavbar = NO_NAVBAR_ROUTES.includes(router.pathname);

  return (
    <SessionProvider session={session}>
      
      {/* SEO Default Settings */}
      <DefaultSeo
        title="Health Info - Trusted Medical Information & Resources"
        description="Your trusted source for medical information, health conditions, symptoms, treatments, and wellness advice."
        canonical="https://niinfomed.com/"
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: 'https://niinfomed.com/',
          site_name: 'Niinfomed',
        }}
        additionalMetaTags={[
          {
            name: "medical-disclaimer",
            content:
              "This website provides general health information and is not a substitute for professional medical advice.",
          },
        ]}
      />

      {/* Hreflang for US & UK */}
      <Head>
        <link
          rel="alternate"
          hrefLang="en-us"
          href="https://niinfomed.com/us/"
        />
        <link
          rel="alternate"
          hrefLang="en-gb"
          href="https://niinfomed.com/uk/"
        />
      </Head>

      {/* Layout */}
      <Layout hideNavbar={hideNavbar}>
        <Component {...pageProps} />
      </Layout>

      {/* Global Medical Disclaimer */}
      <div
        style={{
          background: "#fff3cd",
          padding: "10px",
          textAlign: "center",
          fontSize: "14px",
          borderTop: "1px solid #ffeeba",
        }}
      >
        This website provides informational content only and does not
        constitute medical advice. Always consult a qualified healthcare
        professional.
      </div>

      {/* GDPR Cookie Consent */}
      <CookieConsent
        location="bottom"
        buttonText="Accept"
        enableDeclineButton
        declineButtonText="Decline"
        cookieName="niinfomed_cookie_consent"
        style={{ background: "#222" }}
        buttonStyle={{ color: "#fff", background: "#0a84ff" }}
        expires={365}
      >
        We use cookies to improve your experience. By using our site, you
        agree to our Privacy Policy.
      </CookieConsent>

    </SessionProvider>
  );
}

export default MyApp;
