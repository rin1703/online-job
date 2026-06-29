import cors, { CorsOptions } from "cors";

export function buildCorsOptions(): CorsOptions {
  const whitelist = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : [];

  const allowCredentials = process.env.CORS_CREDENTIALS === "true";

  const options: CorsOptions = {
    credentials: allowCredentials,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
    origin: (origin, cb) => {
      // Allow requests without Origin (Postman/cURL)
      if (!origin) return cb(null, true);
      if (whitelist.length === 0) return cb(null, true);
      if (whitelist.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  };

  return options;
}

export const corsConfig = cors(buildCorsOptions());
