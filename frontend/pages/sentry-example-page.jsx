import Head from "next/head";
import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

class SentryExampleFrontendError extends Error {
  constructor(message) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

export default function Page() {
  const [hasSentError, setHasSentError] = useState(false);

  async function throwError() {
    try {
      await Sentry.startSpan(
        {
          name: "Example Frontend Span",
          op: "test",
        },
        async () => {
          const res = await fetch("/api/sentry-example-api");

          if (!res.ok) {
            throw new SentryExampleFrontendError(
              "This error is raised on the frontend."
            );
          }
        }
      );
    } catch (error) {
      Sentry.captureException(error);
      setHasSentError(true);
    }
  }

  return (
    <div>
      <Head>
        <title>Sentry Example</title>
        <meta name="description" content="Sentry test page" />
      </Head>

      <main>
        <h1>Sentry Test Page</h1>

        <button onClick={throwError}>
          Throw Sample Error
        </button>

        {hasSentError && (
          <p style={{ color: "green", fontSize: "18px" }}>
            Error sent to Sentry successfully.
          </p>
        )}
      </main>

      <style jsx>{`
        main {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
          font-family: system-ui;
        }

        button {
          padding: 12px 20px;
          font-size: 18px;
          background: #553db8;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}