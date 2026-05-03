import { ErrorDeValidacion } from "../../../shared/domain";

export class IdCita {
  private readonly valorInterno: string;

  constructor(valor: string) {
    if (!valor || valor.trim().length === 0) {
      throw new ErrorDeValidacion("El ID de la cita es obligatorio.");
    }
    this.valorInterno = valor.trim();
  }

  get valor(): string {
    return this.valorInterno;
  }
}
