export interface CitaRespuestaDTO {
  id: string;
  idLead: string;
  idUsuario: string;
  idPropiedad?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  observacion?: string;
}

export interface CrearCitaDTO {
  idLead: string;
  idUsuario: string;
  idPropiedad?: string;
  fechaInicio: string;
  duracionMinutos?: number;
  observacion?: string;
}

export interface ReprogramarCitaDTO {
  nuevaFecha: string;
  duracionMinutos?: number;
}

export interface CancelarCitaDTO {
  motivo?: string;
}
