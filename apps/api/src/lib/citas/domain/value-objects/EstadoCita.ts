import { ErrorDeValidacion } from "../../../shared/domain";

export type ValorEstadoCita = "PENDIENTE" | "REPROGRAMADA" | "CANCELADA" | "REALIZADA" | "NO_PRESENTADO";

export class EstadoCita {
  private static readonly VALORES_VALIDOS: ValorEstadoCita[] = [
    "PENDIENTE",
    "REPROGRAMADA",
    "CANCELADA",
    "REALIZADA",
    "NO_PRESENTADO",
  ];

  private readonly valorInterno: ValorEstadoCita;

  constructor(valor: string) {
    const valorMayus = valor.toUpperCase() as ValorEstadoCita;

    if (!EstadoCita.VALORES_VALIDOS.includes(valorMayus)) {
      throw new ErrorDeValidacion(`Estado de cita inválido: ${valor}`);
    }

    this.valorInterno = valorMayus;
  }

  static pendiente(): EstadoCita {
    return new EstadoCita("PENDIENTE");
  }

  static reprogramada(): EstadoCita {
    return new EstadoCita("REPROGRAMADA");
  }

  static cancelada(): EstadoCita {
    return new EstadoCita("CANCELADA");
  }

  static realizada(): EstadoCita {
    return new EstadoCita("REALIZADA");
  }

  static noPresentado(): EstadoCita {
    return new EstadoCita("NO_PRESENTADO");
  }

  get valor(): ValorEstadoCita {
    return this.valorInterno;
  }

  estaTerminada(): boolean {
    return ["REALIZADA", "CANCELADA", "NO_PRESENTADO"].includes(this.valorInterno);
  }

  puedeReprogramarse(): boolean {
    return !this.estaTerminada();
  }
}
