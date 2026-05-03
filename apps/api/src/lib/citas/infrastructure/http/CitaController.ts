import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { CrearCitaUseCase } from "../../application";
import { D1CitaRepository } from "../persistence/D1CitaRepository";
import { CitaMapper } from "../persistence/CitaMapper";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";
import { type CrearCitaDTO } from "../../application/dto/CitaDTOs";

export type BindingsCitas = {
  DB: D1DatabaseLike;
};

type ContextoCitas = Context<{ Bindings: BindingsCitas }>;

export class CitaController {
  async crear(c: ContextoCitas): Promise<Response> {
    try {
      const body = await c.req.json<CrearCitaDTO>();
      const repo = new D1CitaRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new CrearCitaUseCase(repo, generadorId);

      const resultado = await useCase.ejecutar(body);

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
      const repo = new D1CitaRepository(c.env.DB);
      const citas = await repo.listarTodos();

      return c.json({
        success: true,
        data: citas.map((cita) => CitaMapper.aRespuesta(cita)),
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
    return c.json(
      { success: false, message: error.message, code: error.codigo },
      400,
    );
  }
}
