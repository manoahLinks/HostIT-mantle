import mongoose from "mongoose";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<typeof mongoose | null> => {
  const uri = process.env.MONGODB_URL as string | undefined;

  // Gracefully handle missing configuration instead of throwing at import time.
  if (!uri) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[db] NEXT_PUBLIC_MONGODB_URL is not set; skipping DB connection.");
    }
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(
        `${uri}?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true`,
        {
          tls: true,
          tlsAllowInvalidCertificates: true,
        }
      )
      .then((mongoose) => {
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
