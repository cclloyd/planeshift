export interface FoundryEnv {
  FOUNDRY_URL: string;
  FOUNDRY_USER: string;
  FOUNDRY_PASS: string;
  FOUNDRY_ADMIN_PASS?: string;
  FOUNDRY_LOG_ENABLED: boolean;
}

export const dotEnv: FoundryEnv = {
  FOUNDRY_URL: process.env.FOUNDRY_URL!,
  FOUNDRY_USER: process.env.FOUNDRY_USER!,
  FOUNDRY_PASS: process.env.FOUNDRY_PASS!,
  FOUNDRY_ADMIN_PASS: process.env.FOUNDRY_ADMIN_PASS,
  FOUNDRY_LOG_ENABLED: Boolean(process.env.FOUNDRY_LOG_ENABLED).valueOf(),
};
