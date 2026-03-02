import * as Sentry from "@sentry/nextjs";

export default async function handler(req, res) {
  try {
    throw new Error("Test API error for Sentry");
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: "Error sent to Sentry" });
  }
}