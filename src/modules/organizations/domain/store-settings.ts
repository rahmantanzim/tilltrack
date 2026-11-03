/** Where a till's float stays overnight (decision D-8). */
export const FLOAT_OVERNIGHT_OPTIONS = ["drawer", "safe"] as const;

export type FloatOvernight = (typeof FLOAT_OVERNIGHT_OPTIONS)[number];

export const DEFAULT_FLOAT_OVERNIGHT: FloatOvernight = "drawer";

/** Only Canadian dollars are supported for now (requirements, section 8). */
export const SUPPORTED_CURRENCIES = ["CAD"] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "CAD";
