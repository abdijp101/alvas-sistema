import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type ICitaRepository } from "../../domain/ports";
import { Cita } from "../../domain/entities";
import { IdUsuario, type ValorRolUsuario } from "../../../usuarios/domain/value-objects";

export type ListarCitasInput = {
  usuarioAutenticado: {
    id: string;
    rol: ValorRolUsuario;
  };
};

export class ListarCitasUseCase implements CasoDeUso<ListarCitasInput, Resultado<Cita[], ErrorDeDominio>> {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async ejecutar(input: ListarCitasInput): Promise<Resultado<Cita[], ErrorDeDominio>> {
    try {
      const { usuarioAutenticado } = input;
      let citas: Cita[];

      if (usuarioAutenticado.rol === "ADMIN") {
        citas = await this.citaRepository.listarTodos();
      } else {
        const idUsuario = new IdUsuario(usuarioAutenticado.id);
        citas = await this.citaRepository.obtenerPorUsuario(idUsuario);
      }

      return resultadoExitoso(citas);
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}
