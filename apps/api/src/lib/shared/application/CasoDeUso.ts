export interface CasoDeUso<TEntrada, TSalida> {
  ejecutar(entrada: TEntrada): Promise<TSalida> | TSalida;
}
