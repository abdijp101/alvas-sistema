import { Hono } from "hono";
import { ErrorDeDominio } from "./lib/shared/domain";
import { crearAuthController } from "./lib/auth";
import { crearUsuarioController } from "./lib/usuarios";
import { type PayloadToken } from "./lib/auth/domain";
import { type D1DatabaseLike } from "./lib/shared";

type AppBindings = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
};

type AppVariables = {
  authPayload: PayloadToken;
};

const app = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

app.get("/health", (c) => c.json({ status: "ok", service: "alvas-api" }));
app.route("/usuarios", crearUsuarioController());
app.route("/auth", crearAuthController());

app.onError((error, c) => {
  if (error instanceof ErrorDeDominio) {
    return c.json(
      {
        success: false,
        message: error.message,
        code: error.codigo,
      },
      400,
    );
  }

  return c.json(
    {
      success: false,
      message: "Error interno del servidor.",
    },
    500,
  );
});

export default app;
