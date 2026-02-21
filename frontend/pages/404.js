import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

// Language detection utility
const detectLanguageFromPath = (path) => {
  const langPrefixes = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as'];
  const pathParts = path.split('/').filter(Boolean);
  
  if (pathParts.length > 0 && langPrefixes.includes(pathParts[0])) {
    return pathParts[0];
  }
  return 'en'; // Default to English
};

// Language-specific content
const languageContent = {
  en: {
    title: 'Page Not Found - Niinfomed',
    description: 'The page you are looking for could not be found.',
    heading: '404',
    subheading: 'Page Not Found',
    message: "The page you are looking for doesn't exist or has been moved.",
    homeLink: 'Go to Homepage',
    searchLink: 'Search',
    browseLink: 'Browse Conditions',
    contactLink: 'Contact Support',
    suggestions: 'You might want to:',
  },
  hi: {
    title: 'पृष्ठ नहीं मिला - Niinfomed',
    description: 'आप जिस पृष्ठ की तलाश कर रहे हैं वह नहीं मिल सका।',
    heading: '404',
    subheading: 'पृष्ठ नहीं मिला',
    message: 'आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।',
    homeLink: 'होमपेज पर जाएं',
    searchLink: 'खोजें',
    browseLink: 'स्थितियां देखें',
    contactLink: 'सहायता से संपर्क करें',
    suggestions: 'आप यह कर सकते हैं:',
  },
  bn: {
    title: 'পৃষ্ঠা পাওয়া যায়নি - Niinfomed',
    description: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা পাওয়া যায়নি।',
    heading: '404',
    subheading: 'পৃষ্ঠা পাওয়া যায়নি',
    message: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা স্থানান্তরিত হয়েছে।',
    homeLink: 'হোমপেজে যান',
    searchLink: 'অনুসন্ধান',
    browseLink: 'অবস্থা দেখুন',
    contactLink: 'সহায়তার সাথে যোগাযোগ করুন',
    suggestions: 'আপনি চাইতে পারেন:',
  },
  te: {
    title: 'పేజీ కనుగొనబడలేదు - Niinfomed',
    description: 'మీరు వెతుకుతున్న పేజీ కనుగొనబడలేదు.',
    heading: '404',
    subheading: 'పేజీ కనుగొనబడలేదు',
    message: 'మీరు వెతుకుతున్న పేజీ ఉనికిలో లేదు లేదా తరలించబడింది.',
    homeLink: 'హోమ్‌పేజీకి వెళ్ళండి',
    searchLink: 'శోధించండి',
    browseLink: 'పరిస్థితులు చూడండి',
    contactLink: 'మద్దతును సంప్రదించండి',
    suggestions: 'మీరు వీటిని ప్రయత్నించవచ్చు:',
  },
  mr: {
    title: 'पृष्ठ सापडले नाही - Niinfomed',
    description: 'आपण शोधत असलेले पृष्ठ सापडले नाही.',
    heading: '404',
    subheading: 'पृष्ठ सापडले नाही',
    message: 'आपण शोधत असलेले पृष्ठ अस्तित्वात नाही किंवा हलविले गेले आहे.',
    homeLink: 'मुखपृष्ठावर जा',
    searchLink: 'शोधा',
    browseLink: 'स्थिती पहा',
    contactLink: 'समर्थनाशी संपर्क साधा',
    suggestions: 'आपण हे करू शकता:',
  },
  ta: {
    title: 'பக்கம் கிடைக்கவில்லை - Niinfomed',
    description: 'நீங்கள் தேடும் பக்கம் கிடைக்கவில்லை.',
    heading: '404',
    subheading: 'பக்கம் கிடைக்கவில்லை',
    message: 'நீங்கள் தேடும் பக்கம் இல்லை அல்லது நகர்த்தப்பட்டுள்ளது.',
    homeLink: 'முகப்புக்குச் செல்லவும்',
    searchLink: 'தேடு',
    browseLink: 'நிலைமைகளைப் பார்க்கவும்',
    contactLink: 'உதவியைத் தொடர்புகொள்ளவும்',
    suggestions: 'நீங்கள் இதை முயற்சிக்கலாம்:',
  },
  ur: {
    title: 'صفحہ نہیں ملا - Niinfomed',
    description: 'آپ جس صفحہ کی تلاش کر رہے ہیں وہ نہیں ملا۔',
    heading: '404',
    subheading: 'صفحہ نہیں ملا',
    message: 'آپ جس صفحہ کی تلاش کر رہے ہیں وہ موجود نہیں ہے یا منتقل کر دیا گیا ہے۔',
    homeLink: 'ہوم پیج پر جائیں',
    searchLink: 'تلاش کریں',
    browseLink: 'شرائط دیکھیں',
    contactLink: 'سپورٹ سے رابطہ کریں',
    suggestions: 'آپ یہ کر سکتے ہیں:',
  },
  gu: {
    title: 'પૃષ્ઠ મળ્યું નથી - Niinfomed',
    description: 'તમે જે પૃષ્ઠ શોધી રહ્યા છો તે મળ્યું નથી.',
    heading: '404',
    subheading: 'પૃષ્ઠ મળ્યું નથી',
    message: 'તમે જે પૃષ્ઠ શોધી રહ્યા છો તે અસ્તિત્વમાં નથી અથવા ખસેડવામાં આવ્યું છે.',
    homeLink: 'હોમપેજ પર જાઓ',
    searchLink: 'શોધો',
    browseLink: 'સ્થિતિઓ જુઓ',
    contactLink: 'સપોર્ટનો સંપર્ક કરો',
    suggestions: 'તમે આ કરી શકો છો:',
  },
  kn: {
    title: 'ಪುಟ ಸಿಗಲಿಲ್ಲ - Niinfomed',
    description: 'ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟ ಸಿಗಲಿಲ್ಲ.',
    heading: '404',
    subheading: 'ಪುಟ ಸಿಗಲಿಲ್ಲ',
    message: 'ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟ ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ ಅಥವಾ ಸ್ಥಳಾಂತರಿಸಲಾಗಿದೆ.',
    homeLink: 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ',
    searchLink: 'ಹುಡುಕಿ',
    browseLink: 'ಪರಿಸ್ಥಿತಿಗಳನ್ನು ನೋಡಿ',
    contactLink: 'ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ',
    suggestions: 'ನೀವು ಇದನ್ನು ಪ್ರಯತ್ನಿಸಬಹುದು:',
  },
  ml: {
    title: 'പേജ് കണ്ടെത്തിയില്ല - Niinfomed',
    description: 'നിങ്ങൾ തിരയുന്ന പേജ് കണ്ടെത്താനായില്ല.',
    heading: '404',
    subheading: 'പേജ് കണ്ടെത്തിയില്ല',
    message: 'നിങ്ങൾ തിരയുന്ന പേജ് നിലവിലില്ല അല്ലെങ്കിൽ മാറ്റപ്പെട്ടു.',
    homeLink: 'ഹോംപേജിലേക്ക് പോകുക',
    searchLink: 'തിരയുക',
    browseLink: 'അവസ്ഥകൾ കാണുക',
    contactLink: 'പിന്തുണയുമായി ബന്ധപ്പെടുക',
    suggestions: 'നിങ്ങൾക്ക് ഇത് ചെയ്യാവുന്നതാണ്:',
  },
  or: {
    title: 'ପୃଷ୍ଠା ମିଳିଲା ନାହିଁ - Niinfomed',
    description: 'ଆପଣ ଖୋଜୁଥିବା ପୃଷ୍ଠାଟି ମିଳିଲା ନାହିଁ।',
    heading: '404',
    subheading: 'ପୃଷ୍ଠା ମିଳିଲା ନାହିଁ',
    message: 'ଆପଣ ଖୋଜୁଥିବା ପୃଷ୍ଠାଟି ବିଦ୍ୟମାନ ନାହିଁ କିମ୍ବା ସ୍ଥାନାନ୍ତରିତ ହୋଇଯାଇଛି।',
    homeLink: 'ହୋମପେଜ୍‌କୁ ଯାଆନ୍ତୁ',
    searchLink: 'ସନ୍ଧାନ କରନ୍ତୁ',
    browseLink: 'ଅବସ୍ଥାଗୁଡ଼ିକ ଦେଖନ୍ତୁ',
    contactLink: 'ସହାୟତା ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ',
    suggestions: 'ଆପଣ ଏହା କରିପାରିବେ:',
  },
  pa: {
    title: 'ਸਫ਼ਾ ਨਹੀਂ ਮਿਲਿਆ - Niinfomed',
    description: 'ਜਿਸ ਸਫ਼ੇ ਦੀ ਤੁਸੀਂ ਭਾਲ ਕਰ ਰਹੇ ਹੋ ਉਹ ਨਹੀਂ ਮਿਲ ਸਕਿਆ।',
    heading: '404',
    subheading: 'ਸਫ਼ਾ ਨਹੀਂ ਮਿਲਿਆ',
    message: 'ਜਿਸ ਸਫ਼ੇ ਦੀ ਤੁਸੀਂ ਭਾਲ ਕਰ ਰਹੇ ਹੋ ਉਹ ਮੌਜੂਦ ਨਹੀਂ ਹੈ ਜਾਂ ਟ੍ਰਾਂਸਫਰ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।',
    homeLink: 'ਹੋਮਪੇਜ ਤੇ ਜਾਓ',
    searchLink: 'ਖੋਜ ਕਰੋ',
    browseLink: 'ਸਥਿਤੀਆਂ ਵੇਖੋ',
    contactLink: 'ਸਹਾਇਤਾ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
    suggestions: 'ਤੁਸੀਂ ਇਹ ਕਰ ਸਕਦੇ ਹੋ:',
  },
  as: {
    title: 'পৃষ্ঠা পোৱা নগ\'ল - Niinfomed',
    description: 'আপুনি বিচৰা পৃষ্ঠাটো পোৱা নগ\'ল।',
    heading: '404',
    subheading: 'পৃষ্ঠা পোৱা নগ\'ল',
    message: 'আপুনি বিচৰা পৃষ্ঠাটো বিদ্যমান নাই বা স্থানান্তৰিত হৈছে।',
    homeLink: 'হ\'মপেইজলৈ যাওক',
    searchLink: 'সন্ধান কৰক',
    browseLink: 'অৱস্থাসমূহ চাওক',
    contactLink: 'সহায়ৰ সৈতে যোগাযোগ কৰক',
    suggestions: 'আপুনি এইকেইটা কৰিব পাৰে:',
  },
};

// Default content for unsupported languages (falls back to English)
const getContent = (lang) => {
  return languageContent[lang] || languageContent.en;
};

export default function Custom404() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setMounted(true);
    // Detect language from the current path
    if (router.asPath) {
      const detectedLang = detectLanguageFromPath(router.asPath);
      setLanguage(detectedLang);
    }
  }, [router.asPath]);

  const content = getContent(language);

  const languageAlternates = [
    { hrefLang: 'en', href: 'https://niinfomed.com/404' },
    { hrefLang: 'hi', href: 'https://niinfomed.com/hi/404' },
    { hrefLang: 'bn', href: 'https://niinfomed.com/bn/404' },
    { hrefLang: 'te', href: 'https://niinfomed.com/te/404' },
    { hrefLang: 'mr', href: 'https://niinfomed.com/mr/404' },
    { hrefLang: 'ta', href: 'https://niinfomed.com/ta/404' },
    { hrefLang: 'ur', href: 'https://niinfomed.com/ur/404' },
    { hrefLang: 'gu', href: 'https://niinfomed.com/gu/404' },
    { hrefLang: 'kn', href: 'https://niinfomed.com/kn/404' },
    { hrefLang: 'ml', href: 'https://niinfomed.com/ml/404' },
    { hrefLang: 'or', href: 'https://niinfomed.com/or/404' },
    { hrefLang: 'pa', href: 'https://niinfomed.com/pa/404' },
    { hrefLang: 'as', href: 'https://niinfomed.com/as/404' },
    { hrefLang: 'x-default', href: 'https://niinfomed.com/404' },
  ];

  if (!mounted) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="animate-pulse">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-neutral-200"></div>
          <div className="mx-auto w-48 h-8 mb-4 rounded bg-neutral-200"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title={content.title}
        description={content.description}
        noindex={true}
        languageAlternates={languageAlternates}
      />

      <div className="container-custom py-16 text-center">
        {/* Large 404 with animation */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-primary opacity-10 select-none">
            {content.heading}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-bold text-primary">
              {content.heading}
            </span>
          </div>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <h2 className="text-3xl font-semibold text-neutral-800 mb-4">
          {content.subheading}
        </h2>
        
        <p className="text-lg text-neutral-600 mb-4 max-w-2xl mx-auto">
          {content.message}
        </p>

        {/* Show the attempted URL if it exists */}
        {router.asPath && router.asPath !== '/404' && (
          <div className="mb-8">
            <p className="text-sm text-neutral-500 mb-2">
              Attempted URL:
            </p>
            <code className="text-sm bg-neutral-100 px-4 py-2 rounded-lg inline-block">
              {router.asPath}
            </code>
          </div>
        )}

        {/* Suggestions */}
        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
            {content.suggestions}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href={`/${language !== 'en' ? language : ''}`}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {content.homeLink}
            </Link>
            
            <Link 
              href={`/${language !== 'en' ? language + '/' : ''}search`}
              className="btn-secondary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {content.searchLink}
            </Link>

            <Link 
              href={`/${language !== 'en' ? language + '/' : ''}conditions`}
              className="btn-secondary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {content.browseLink}
            </Link>

            <Link 
              href={`/${language !== 'en' ? language + '/' : ''}contact`}
              className="btn-secondary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {content.contactLink}
            </Link>
          </div>
        </div>

        {/* Language Switcher Hint */}
        <div className="text-sm text-neutral-400">
          <p>
            {language !== 'en' ? 'Viewing in ' + language.toUpperCase() : 'English'}
          </p>
        </div>

        {/* Debug Info - Only in Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-neutral-900 text-neutral-300 rounded-lg text-left overflow-auto">
            <p className="text-xs font-mono">
              <span className="text-yellow-400">Debug Info:</span><br />
              Language: {language}<br />
              Path: {router.asPath}<br />
              Route: {router.pathname}
            </p>
          </div>
        )}
      </div>
    </>
  );
}