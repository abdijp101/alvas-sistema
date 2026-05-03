export type DetalleErrorDeDominio = Readonly<Record<string, unknown>>;

type ErrorDeDominioParams = {
  codigo?: string;
  detalle?: DetalleErrorDeDominio;
};

export class ErrorDeDominio extends Error {
  public readonly codigo: string;
  public readonly detalle?: DetalleErrorDeDominio;

  constructor(mensaje: string, params?: ErrorDeDominioParams) {
    super(mensaje);
    this.name = "ErrorDeDominio";
    this.codigo = params?.codigo ?? "ERROR_DE_DOMINIO";
    this.detalle = params?.detalle;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
