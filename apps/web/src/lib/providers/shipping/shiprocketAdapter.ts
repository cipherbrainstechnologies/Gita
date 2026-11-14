import {z} from "zod";

/** Fail-closed logistics adapter. Never invents AWB or tracking. */
export type LogisticsStatus = "NOT_CONFIGURED" | "SANDBOX" | "UNAVAILABLE";
export type Serviceability = {ok: true; serviceable: boolean; estimateDays?: number} | {ok: false; code: string; message: string};

export class ShiprocketAdapter {
  readonly id = "shiprocket";
  constructor(private readonly cfg: {email?: string; password?: string; token?: string} = {}) {}
  get status(): LogisticsStatus {
    if (!this.cfg.email && !this.cfg.token) return "NOT_CONFIGURED";
    return "SANDBOX";
  }
  async serviceability(pincode: string): Promise<Serviceability> {
    const p = z.string().regex(/^\d{6}$/).safeParse(pincode);
    if (!p.success) return {ok: false, code: "INVALID_PINCODE", message: "Indian pincode must be 6 digits."};
    if (this.status === "NOT_CONFIGURED") {
      return {ok: false, code: "NOT_CONFIGURED", message: "Shiprocket credentials are not configured. No serviceability claim is made."};
    }
    // Without a live token we refuse to invent coverage.
    return {ok: false, code: "UNAVAILABLE", message: "Shiprocket API call not executed; configure and test-connection first."};
  }
  async bookShipment(): Promise<{ok: false; code: string; message: string}> {
    return {ok: false, code: "NOT_IMPLEMENTED", message: "Shipment booking stays closed until QC-ready parcels and live Shiprocket credentials exist."};
  }
}

export function getLogisticsProvider(env: NodeJS.ProcessEnv = process.env) {
  return new ShiprocketAdapter({
    email: env.SHIPROCKET_EMAIL,
    password: env.SHIPROCKET_PASSWORD,
    token: env.SHIPROCKET_TOKEN,
  });
}
