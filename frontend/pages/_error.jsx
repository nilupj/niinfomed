// pages/_error.jsx
import NextErrorComponent from 'next/error';

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
  // Just render the Next.js error component
  return <NextErrorComponent statusCode={statusCode} />;
};

MyError.getInitialProps = async (context) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(context);
  const { res, err, asPath } = context;

  errorInitialProps.hasGetInitialPropsRun = true;

  // Return 404 pages as-is
  if (res?.statusCode === 404) {
    return errorInitialProps;
  }

  // Log error to console in development
  if (err && process.env.NODE_ENV === 'development') {
    console.error('Error caught in _error.js:', err);
  }

  return errorInitialProps;
};

export default MyError;