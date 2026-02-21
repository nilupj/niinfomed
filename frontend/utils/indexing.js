
import axios from 'axios';

// IndexNow API implementation
export const submitToIndexNow = async (urls) => {
  const indexNowKey = process.env.NEXT_PUBLIC_INDEXNOW_KEY;
  
  if (!indexNowKey) {
    console.warn('IndexNow key not configured');
    return;
  }

  const payload = {
    host: process.env.NEXT_PUBLIC_SITE_URL || 'Niinfomed.com',
    key: indexNowKey,
    keyLocation: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://Niinfomed.com'}/${indexNowKey}.txt`,
    urlList: Array.isArray(urls) ? urls : [urls]
  };

  try {
    // Submit to Bing IndexNow
    await axios.post('https://api.indexnow.org/indexnow', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Also submit to Yandex IndexNow
    await axios.post('https://yandex.com/indexnow', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Successfully submitted to IndexNow:', urls);
  } catch (error) {
    console.error('IndexNow submission failed:', error.message);
  }
};

// Google Indexing API implementation
export const submitToGoogleIndexing = async (url, type = 'URL_UPDATED') => {
  const apiKey = process.env.GOOGLE_INDEXING_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Indexing API key not configured');
    return;
  }

  try {
    const response = await axios.post(
      `https://indexing.googleapis.com/v3/urlNotifications:publish?key=${apiKey}`,
      {
        url: url,
        type: type // URL_UPDATED or URL_DELETED
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Successfully submitted to Google Indexing API:', url);
    return response.data;
  } catch (error) {
    console.error('Google Indexing API submission failed:', error.message);
  }
};

// Utility to notify both services
export const notifySearchEngines = async (url) => {
  await Promise.all([
    submitToIndexNow(url),
    submitToGoogleIndexing(url)
  ]);
};
