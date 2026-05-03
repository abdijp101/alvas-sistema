import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { Pbkdf2PasswordHasher } from "../../../shared/infrastructure/security/Pbkdf2PasswordHasher";
import { IniciarSesionUseCase } from "../../application/use-cases/IniciarSesionUseCase";
import { RenovarSesionUseCase } from "../../application/use-cases/RenovarSesionUseCase";
import { D1UsuarioRepository } from "../../../usuarios/infrastructure/persistence/D1UsuarioRepository";
import { HmacTokenProvider } from "../security/HmacTokenProvider";
import { type IniciarSesionInput } from "../../application/use-cases/IniciarSesionUseCase";

export type BindingsAuth = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
};

type ContextoAuth = Context<{ Bindings: BindingsAuth }>;

export class AuthController {
  async iniciarSesion(c: ContextoAuth): Promise<Response> {
    try {
      const body = await c.req.json<IniciarSesionInput>();
      const repo = new D1UsuarioRepository(c.env.DB);
      const passwordHasher = new Pbkdf2PasswordHasher(c.env.AUTH_PEPPER);
      const tokenProvider = new HmacTokenProvider({
        authSecret: c.env.AUTH_SECRET,
        refreshSecret: c.env.AUTH_REFRESH_SECRET,
        authTokenTtlSegundos: c.env.AUTH_TOKEN_TTL_SEGUNDOS ? parseInt(c.env.AUTH_TOKEN_TTL_SEGUNDOS) : 900,
        refreshTokenTtlSegundos: c.env.REFRESH_TOKEN_TTL_SEGUNDOS ? parseInt(c.env.REFRESH_TOKEN_TTL_SEGUNDOS) : 604800,
      });

      const useCase = new IniciarSesionUseCase(repo, passwordHasher, tokenProvider);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          {
            success: false,
            message: resultado.error.message,
            code: resultado.error.codigo,
          },
          401,
        );
      }

      return c.json({
        success: true,
        data: resultado.valor,
      });
    } catch (error) {
      console.error("Error inesperado en AuthController.iniciarSesion:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
        },
        500,
      );
    }
  }

  async renovarSesion(c: ContextoAuth): Promise<Response> {
    try {
      const { refreshToken } = await c.req.json<{ refreshToken: string }>();
      const repo = new D1UsuarioRepository(c.env.DB);
      const tokenProvider = new HmacTokenProvider({
        authSecret: c.env.AUTH_SECRET,
        refreshSecret: c.env.AUTH_REFRESH_SECRET,
        authTokenTtlSegundos: c.env.AUTH_TOKEN_TTL_SEGUNDOS ? parseInt(c.env.AUTH_TOKEN_TTL_SEGUNDOS) : 900,
        refreshTokenTtlSegundos: c.env.REFRESH_TOKEN_TTL_SEGUNDOS ? parseInt(c.env.REFRESH_TOKEN_TTL_SEGUNDOS) : 604800,
      });

      const useCase = new RenovarSesionUseCase(repo, tokenProvider);
      const resultado = await useCase.ejecutar({ refreshToken });

      if (!resultado.esExito) {
        return c.json(
          {
            success: false,
            message: resultado.error.message,
            code: resultado.error.codigo,
          },
          401,
        );
      }

      return c.json({
        success: true,
        data: resultado.valor,
      });
    } catch (error) {
      console.error("Error inesperado en AuthController.renovarSesion:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
        },
        500,
      );
    }
  }
}
