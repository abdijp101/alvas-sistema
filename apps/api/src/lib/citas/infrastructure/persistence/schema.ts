import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const citasTable = sqliteTable("citas", {
  id: text("id").primaryKey(),
  idLead: text("id_lead").notNull(),
  idUsuario: text("id_usuario").notNull(),
  idPropiedad: text("id_propiedad"),
  fechaInicio: text("fecha_inicio").notNull(),
  fechaFin: text("fecha_fin").notNull(),
  estado: text("estado").notNull(),
  observacion: text("observacion"),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export type CitaRow = typeof citasTable.$inferSelect;
export type NuevaCitaRow = typeof citasTable.$inferInsert;
