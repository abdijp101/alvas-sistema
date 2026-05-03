import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usuariosTable = sqliteTable("usuarios", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull().default("Usuario"),
  hashClave: text("hash_clave").notNull(),
  rol: text("rol").notNull(),
  estado: text("estado").notNull(),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export type UsuarioRow = typeof usuariosTable.$inferSelect;
export type UsuarioInsert = typeof usuariosTable.$inferInsert;
