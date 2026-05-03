import { HmacTokenProvider } from "./HmacTokenProvider";

type TokenEnv = {
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
};

export const crearTokenProviderDesdeEnv = (env: TokenEnv): HmacTokenProvider =>
  new HmacTokenProvider({
    authSecret: env.AUTH_SECRET,
    refreshSecret: env.AUTH_REFRESH_SECRET,
    authTokenTtlSegundos: Number(env.AUTH_TOKEN_TTL_SEGUNDOS ?? "900"),
    refreshTokenTtlSegundos: Number(env.REFRESH_TOKEN_TTL_SEGUNDOS ?? String(60 * 60 * 24 * 7)),
  });
