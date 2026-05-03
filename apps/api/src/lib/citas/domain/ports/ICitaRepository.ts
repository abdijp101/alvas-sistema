import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Cita } from "../entities";
import { IdCita } from "../value-objects";
import { IdUsuario } from "../../../usuarios/domain/value-objects/IdUsuario";

export interface ICitaRepository
  extends IRepositorioLectura<Cita, IdCita>,
    IRepositorioEscritura<Cita, IdCita> {
  
  listarTodos(): Promise<Cita[]>;
  obtenerPorUsuarioYFecha(idUsuario: IdUsuario, inicio: Date, fin: Date): Promise<Cita[]>;
  obtenerPorUsuario(idUsuario: IdUsuario): Promise<Cita[]>;
  obtenerPorLead(idLead: string): Promise<Cita[]>;
  existeTraslape(idUsuario: IdUsuario, inicio: Date, fin: Date, idCitaExcluir?: IdCita): Promise<boolean>;
}
