import { type MiddlewareHandler } from "hono";
import { ErrorDeDominio } from "../../../../shared/domain";
import { type PayloadToken } from "../../../domain";

type ContextoConAuth = {
  Variables: {
    authPayload: PayloadToken;
  };
};

export const requireRoleMiddleware = <T extends ContextoConAuth>(
  rolesPermitidos: PayloadToken["rol"][],
): MiddlewareHandler<T> => {
  return async (c, next) => {
    const payload = c.get("authPayload");

    if (!rolesPermitidos.includes(payload.rol)) {
      throw new ErrorDeDominio("No tienes permisos para ejecutar esta accion.", {
        codigo: "ROL_NO_PERMITIDO",
      });
    }

    await next();
  };
};
