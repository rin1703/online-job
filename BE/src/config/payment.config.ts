import { PayOS } from "@payos/node";

const isPayOSConfigured = Boolean(
  process.env.PAYOS_CLIENT_ID &&
  process.env.PAYOS_API_KEY &&
  process.env.PAYOS_CHECKSUM_KEY
);

export const payos = isPayOSConfigured
  ? new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID!,
      apiKey: process.env.PAYOS_API_KEY!,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
    })
  : null;

export const isPayOSEnabled = isPayOSConfigured;
