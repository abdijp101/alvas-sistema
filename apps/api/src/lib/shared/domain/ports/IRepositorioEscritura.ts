export interface IRepositorioEscritura<TEntidad, TId> {
  guardar(entidad: TEntidad): Promise<void>;
  eliminarPorId(id: TId): Promise<void>;
}
