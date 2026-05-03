import { Hono } from "hono";
import { ErrorDeDominio } from "./lib/shared/domain";
import { type PayloadToken } from "./lib/auth/application";
import { crearAuthRouter } from "./lib/auth/infrastructure";
import { crearUsuarioRouter } from "./lib/usuarios/infrastructure";
import { citaRouter } from "./lib/citas/infrastructure";
import { type D1DatabaseLike } from "./lib/shared/infrastructure";

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
app.route("/usuarios", crearUsuarioRouter());
app.route("/auth", crearAuthRouter());
app.route("/citas", citaRouter);

app.onError((error, c) => {
  if (error instanceof ErrorDeDominio) {
    const status =
      error.codigo === "USUARIO_YA_EXISTE"
        ? 409
        : error.codigo === "AUTH_TOKEN_INVALIDO" ||
            error.codigo === "REFRESH_TOKEN_INVALIDO" ||
            error.codigo === "CREDENCIALES_INVALIDAS"
          ? 401
          : 400;

    return c.json(
      {
        success: false,
        message: error.message,
        code: error.codigo,
      },
      status,
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
