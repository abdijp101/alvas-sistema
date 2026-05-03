import { type MiddlewareHandler } from "hono";
import { AuthTokenInvalidoError } from "../../../domain";
import { type PayloadToken } from "../../../domain/ports/ITokenProvider";
import { AuthToken } from "../../../domain/value-objects";
import { crearTokenProviderDesdeEnv } from "../../security/TokenProviderFactory";

type AuthBindings = {
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
};

type AuthMiddlewareEnv = {
  Bindings: AuthBindings;
  Variables: {
    authPayload: PayloadToken;
  };
};

export const verifyTokenMiddleware = (): MiddlewareHandler<AuthMiddlewareEnv> => {
  return async (c, next) => {
    const authHeader = c.req.header("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      throw new AuthTokenInvalidoError();
    }

    const tokenProvider = crearTokenProviderDesdeEnv(c.env);
    const payload = await tokenProvider.validarAuthToken(new AuthToken(token));

    c.set("authPayload", payload);
    await next();
  };
};
