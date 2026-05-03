import { ErrorDeValidacion } from "../../../shared/domain";
import { IdUsuario } from "../../../usuarios/domain/value-objects/IdUsuario";
import { EstadoCita, IdCita } from "../value-objects";

type PropsCita = {
  id: IdCita;
  idLead: string; // Relación con el módulo de leads
  idUsuario: IdUsuario;
  idPropiedad?: string; // Opcional, si la cita es para una propiedad específica
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoCita;
  observacion?: string;
  creadoEn: Date;
  actualizadoEn: Date;
};

type CrearCitaParams = {
  id: string;
  idLead: string;
  idUsuario: string;
  idPropiedad?: string;
  fechaInicio: Date;
  duracionMinutos?: number;
  observacion?: string;
};

export class Cita {
  private props: PropsCita;

  private constructor(props: PropsCita) {
    this.props = props;
    this.validarFechas();
  }

  static crear(params: CrearCitaParams): Cita {
    const ahora = new Date();
    const duracion = params.duracionMinutos || 60;
    const fechaFin = new Date(params.fechaInicio.getTime() + duracion * 60000);

    return new Cita({
      id: new IdCita(params.id),
      idLead: params.idLead,
      idUsuario: new IdUsuario(params.idUsuario),
      idPropiedad: params.idPropiedad,
      fechaInicio: params.fechaInicio,
      fechaFin,
      estado: EstadoCita.pendiente(),
      observacion: params.observacion,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  }

  static reconstituir(props: PropsCita): Cita {
    return new Cita(props);
  }

  get id(): IdCita { return this.props.id; }
  get idLead(): string { return this.props.idLead; }
  get idUsuario(): IdUsuario { return this.props.idUsuario; }
  get idPropiedad(): string | undefined { return this.props.idPropiedad; }
  get fechaInicio(): Date { return this.props.fechaInicio; }
  get fechaFin(): Date { return this.props.fechaFin; }
  get estado(): EstadoCita { return this.props.estado; }
  get observacion(): string | undefined { return this.props.observacion; }
  get creadoEn(): Date { return this.props.creadoEn; }
  get actualizadoEn(): Date { return this.props.actualizadoEn; }

  reprogramar(nuevaFecha: Date, duracionMinutos?: number): void {
    if (!this.props.estado.puedeReprogramarse()) {
      throw new ErrorDeValidacion(`No se puede reprogramar una cita en estado ${this.props.estado.valor}`);
    }

    const duracion = duracionMinutos || (this.props.fechaFin.getTime() - this.props.fechaInicio.getTime()) / 60000;
    this.props.fechaInicio = nuevaFecha;
    this.props.fechaFin = new Date(nuevaFecha.getTime() + duracion * 60000);
    this.props.estado = EstadoCita.reprogramada();
    this.props.actualizadoEn = new Date();
    this.validarFechas();
  }

  cancelar(motivo?: string): void {
    if (this.props.estado.estaTerminada()) {
      throw new ErrorDeValidacion("No se puede cancelar una cita que ya ha terminado.");
    }

    this.props.estado = EstadoCita.cancelada();
    if (motivo) {
      this.props.observacion = this.props.observacion 
        ? `${this.props.observacion} | Cancelado: ${motivo}` 
        : `Cancelado: ${motivo}`;
    }
    this.props.actualizadoEn = new Date();
  }

  marcarComoRealizada(): void {
    if (this.props.estado.valor !== "PENDIENTE" && this.props.estado.valor !== "REPROGRAMADA") {
      throw new ErrorDeValidacion("Solo se pueden marcar como realizadas las citas pendientes o reprogramadas.");
    }
    this.props.estado = EstadoCita.realizada();
    this.props.actualizadoEn = new Date();
  }

  private validarFechas(): void {
    if (this.props.fechaFin <= this.props.fechaInicio) {
      throw new ErrorDeValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
  }
}
