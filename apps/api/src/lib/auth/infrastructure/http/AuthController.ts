import { Hono } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { D1UsuarioRepository } from "../../../usuarios";
import { IniciarSesionUseCase, RenovarSesionUseCase } from "../../application";
import { AuthTokenInvalidoError, CredencialesInvalidasError } from "../../domain";
import { verifyTokenMiddleware } from "./middlewares/VerifyTokenMiddleware";
import { crearTokenProviderDesdeEnv } from "../security/TokenProviderFactory";
import { Pbkdf2PasswordHasher } from "../../../usuarios/infrastructure/security/Pbkdf2PasswordHasher";

type AuthBindings = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
};

type AuthVariables = {
  authPayload: {
    idUsuario: string;
    rol: "ADMIN" | "ASESOR";
  };
};

export const crearAuthController = () => {
  const router = new Hono<{ Bindings: AuthBindings; Variables: AuthVariables }>();

  router.post("/login", async (c) => {
    try {
      const body = await c.req.json<{ idUsuario: string; clave: string }>();
      const usuarioRepository = new D1UsuarioRepository(c.env.DB);
      const passwordHasher = new Pbkdf2PasswordHasher(c.env.AUTH_PEPPER);
      const tokenProvider = crearTokenProviderDesdeEnv(c.env);
      const useCase = new IniciarSesionUseCase(usuarioRepository, passwordHasher, tokenProvider);
      const sesion = await useCase.ejecutar({
        idUsuario: body.idUsuario,
        clave: body.clave,
      });

      return c.json({ success: true, data: sesion }, 200);
    } catch (error) {
      if (error instanceof CredencialesInvalidasError) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 401);
      }

      if (error instanceof ErrorDeDominio) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 400);
      }

      return c.json({ success: false, message: "Error interno en login." }, 500);
    }
  });

  router.post("/refresh", async (c) => {
    try {
      const body = await c.req.json<{ refreshToken: string }>();
      const usuarioRepository = new D1UsuarioRepository(c.env.DB);
      const tokenProvider = crearTokenProviderDesdeEnv(c.env);
      const useCase = new RenovarSesionUseCase(usuarioRepository, tokenProvider);
      const sesion = await useCase.ejecutar({
        refreshToken: body.refreshToken,
      });

      return c.json({ success: true, data: sesion }, 200);
    } catch (error) {
      if (error instanceof CredencialesInvalidasError || error instanceof AuthTokenInvalidoError) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 401);
      }

      if (error instanceof ErrorDeDominio) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 400);
      }

      return c.json({ success: false, message: "Error interno al renovar sesion." }, 500);
    }
  });

  router.get("/me", verifyTokenMiddleware(), async (c) => {
    return c.json({
      success: true,
      data: c.get("authPayload"),
    });
  });

  return router;
};
