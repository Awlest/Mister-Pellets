import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Helper pour accéder à l'API locale de Payload depuis les Server Components
 * et les API routes. Singleton via le pattern getPayload de Payload v3.
 */
export async function getPayloadClient() {
  return getPayload({ config });
}
