import { type CitaRespuestaDTO } from "../../application/dto/CitaDTOs";
import { Cita } from "../../domain/entities/Cita";
import { EstadoCita, IdCita } from "../../domain/value-objects";
import { IdUsuario } from "../../../usuarios/domain/value-objects";
import { type CitaRow } from "./schema";

export class CitaMapper {
  static aDominio(row: CitaRow): Cita {
    return Cita.reconstituir({
      id: new IdCita(row.id),
      idLead: row.idLead,
      idUsuario: new IdUsuario(row.idUsuario),
      idPropiedad: row.idPropiedad || undefined,
      fechaInicio: new Date(row.fechaInicio),
      fechaFin: new Date(row.fechaFin),
      estado: new EstadoCita(row.estado),
      observacion: row.observacion || undefined,
      creadoEn: new Date(row.creadoEn),
      actualizadoEn: new Date(row.actualizadoEn),
    });
  }

  static aPersistencia(cita: Cita) {
    return {
      id: cita.id.valor,
      idLead: cita.idLead,
      idUsuario: cita.idUsuario.valor,
      idPropiedad: cita.idPropiedad,
      fechaInicio: cita.fechaInicio.toISOString(),
      fechaFin: cita.fechaFin.toISOString(),
      estado: cita.estado.valor,
      observacion: cita.observacion,
      creadoEn: cita.creadoEn.toISOString(),
      actualizadoEn: cita.actualizadoEn.toISOString(),
    };
  }

  static aRespuesta(cita: Cita): CitaRespuestaDTO {
    return {
      id: cita.id.valor,
      idLead: cita.idLead,
      idUsuario: cita.idUsuario.valor,
      idPropiedad: cita.idPropiedad,
      fechaInicio: cita.fechaInicio.toISOString(),
      fechaFin: cita.fechaFin.toISOString(),
      estado: cita.estado.valor,
      observacion: cita.observacion,
    };
  }
}
