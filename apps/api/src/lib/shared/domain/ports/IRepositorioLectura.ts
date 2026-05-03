export interface IRepositorioLectura<TEntidad, TId> {
  obtenerPorId(id: TId): Promise<TEntidad | null>;
  existePorId(id: TId): Promise<boolean>;
}
