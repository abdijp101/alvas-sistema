import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { CrearCitaUseCase, ListarCitasUseCase } from "../../application";
import { D1CitaRepository } from "../persistence/D1CitaRepository";
import { CitaMapper } from "../persistence/CitaMapper";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";
import { type CrearCitaDTO } from "../../application/dto/CitaDTOs";
import { type PayloadToken } from "../../../auth/application";

export type BindingsCitas = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: PayloadToken;
};

type ContextoCitas = Context<{ Bindings: BindingsCitas; Variables: AppVariables }>;

export class CitaController {
  async crear(c: ContextoCitas): Promise<Response> {
    try {
      const body = await c.req.json<CrearCitaDTO>();
      const authPayload = c.get("authPayload");
      const repo = new D1CitaRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new CrearCitaUseCase(repo, generadorId);

      const resultado = await useCase.ejecutar({
        dto: body,
        usuarioAutenticado: {
          id: authPayload.idUsuario,
          rol: authPayload.rol,
        },
      });

      if (!resultado.esExito) {
        return this.responderErrorDeDominio(resultado.error, c);
      }

      return c.json(
        {
          success: true,
          data: CitaMapper.aRespuesta(resultado.valor),
        },
        201,
      );
    } catch (error) {
      console.error("Error inesperado en CitaController.crear:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
          error: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  }

  async listar(c: ContextoCitas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const repo = new D1CitaRepository(c.env.DB);
      const useCase = new ListarCitasUseCase(repo);

      const resultado = await useCase.ejecutar({
        usuarioAutenticado: {
          id: authPayload.idUsuario,
          rol: authPayload.rol,
        },
      });

      if (!resultado.esExito) {
        return this.responderErrorDeDominio(resultado.error, c);
      }

      return c.json({
        success: true,
        data: resultado.valor.map((cita) => CitaMapper.aRespuesta(cita)),
      });
    } catch (error) {
      console.error("Error inesperado en CitaController.listar:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
        },
        500,
      );
    }
  }

  private responderErrorDeDominio(error: ErrorDeDominio, c: ContextoCitas): Response {
    const status = error.codigo === "SIN_PERMISOS" ? 403 : 400;
    return c.json(
      { success: false, message: error.message, code: error.codigo },
      status,
    );
  }
}
