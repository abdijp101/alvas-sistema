import { eq, and, lt, gt, ne } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { Cita } from "../../domain/entities";
import { type ICitaRepository } from "../../domain/ports";
import { IdCita } from "../../domain/value-objects";
import { IdUsuario } from "../../../usuarios/domain/value-objects";
import { obtenerDb } from "../../../usuarios/infrastructure/persistence/drizzle";
import { citasTable, type CitaRow } from "./schema";
import { CitaMapper } from "./CitaMapper";

export class D1CitaRepository implements ICitaRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  async obtenerPorId(id: IdCita): Promise<Cita | null> {
    const row = await this.drizzle()
      .select()
      .from(citasTable)
      .where(eq(citasTable.id, id.valor))
      .get();

    return row ? CitaMapper.aDominio(row as CitaRow) : null;
  }

  async existePorId(id: IdCita): Promise<boolean> {
    const row = await this.drizzle()
      .select({ id: citasTable.id })
      .from(citasTable)
      .where(eq(citasTable.id, id.valor))
      .get();

    return !!row;
  }

  async guardar(cita: Cita): Promise<void> {
    const values = CitaMapper.aPersistencia(cita);

    await this.drizzle()
      .insert(citasTable)
      .values(values)
      .onConflictDoUpdate({
        target: citasTable.id,
        set: {
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin,
          estado: values.estado,
          observacion: values.observacion,
          actualizadoEn: values.actualizadoEn,
        },
      });
  }

  async eliminarPorId(id: IdCita): Promise<void> {
    await this.drizzle()
      .delete(citasTable)
      .where(eq(citasTable.id, id.valor));
  }

  async listarTodos(): Promise<Cita[]> {
    const rows = await this.drizzle()
      .select()
      .from(citasTable)
      .orderBy(citasTable.fechaInicio);

    return rows.map((row) => CitaMapper.aDominio(row as CitaRow));
  }

  async obtenerPorUsuarioYFecha(idUsuario: IdUsuario, inicio: Date, fin: Date): Promise<Cita[]> {
    const rows = await this.drizzle()
      .select()
      .from(citasTable)
      .where(
        and(
          eq(citasTable.idUsuario, idUsuario.valor),
          gt(citasTable.fechaFin, inicio.toISOString()),
          lt(citasTable.fechaInicio, fin.toISOString())
        )
      );

    return rows.map((row) => CitaMapper.aDominio(row as CitaRow));
  }

  async obtenerPorUsuario(idUsuario: IdUsuario): Promise<Cita[]> {
    const rows = await this.drizzle()
      .select()
      .from(citasTable)
      .where(eq(citasTable.idUsuario, idUsuario.valor))
      .orderBy(citasTable.fechaInicio);

    return rows.map((row) => CitaMapper.aDominio(row as CitaRow));
  }

  async obtenerPorLead(idLead: string): Promise<Cita[]> {
    const rows = await this.drizzle()
      .select()
      .from(citasTable)
      .where(eq(citasTable.idLead, idLead))
      .orderBy(citasTable.fechaInicio);

    return rows.map((row) => CitaMapper.aDominio(row as CitaRow));
  }

  async existeTraslape(idUsuario: IdUsuario, inicio: Date, fin: Date, idCitaExcluir?: IdCita): Promise<boolean> {
    const conditions = [
      eq(citasTable.idUsuario, idUsuario.valor),
      gt(citasTable.fechaFin, inicio.toISOString()),
      lt(citasTable.fechaInicio, fin.toISOString()),
      ne(citasTable.estado, "CANCELADA")
    ];

    if (idCitaExcluir) {
      conditions.push(ne(citasTable.id, idCitaExcluir.valor));
    }

    const row = await this.drizzle()
      .select({ id: citasTable.id })
      .from(citasTable)
      .where(and(...conditions))
      .get();

    return !!row;
  }
}
