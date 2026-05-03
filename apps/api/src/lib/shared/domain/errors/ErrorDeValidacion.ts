import { ErrorDeDominio, type DetalleErrorDeDominio } from "./ErrorDeDominio";

export class ErrorDeValidacion extends ErrorDeDominio {
  constructor(mensaje: string, detalle?: DetalleErrorDeDominio) {
    super(mensaje, {
      codigo: "ERROR_DE_VALIDACION",
      detalle,
    });
    this.name = "ErrorDeValidacion";
  }
}
