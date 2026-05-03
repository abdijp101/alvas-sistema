import { type D1DatabaseLike } from "../../../shared/infrastructure";

const SQL_CREAR_TABLA_USUARIOS = "CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, nombre TEXT NOT NULL DEFAULT 'Usuario', hash_clave TEXT NOT NULL, rol TEXT NOT NULL, estado TEXT NOT NULL, creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);";

let esquemaInicializado = false;

const agregarColumnaSegura = async (db: D1DatabaseLike, nombreColumna: string, definicion: string): Promise<void> => {
  try {
    await db.exec(`ALTER TABLE usuarios ADD COLUMN ${nombreColumna} ${definicion};`);
  } catch {
    // Columna ya existe o error no es crítico
  }
};

export const asegurarEsquemaUsuarios = async (db: D1DatabaseLike): Promise<void> => {
  if (esquemaInicializado) {
    return;
  }

  try {
    await db.exec(SQL_CREAR_TABLA_USUARIOS);

    // Intentar agregar columnas que podrían faltar (migraciones legacy)
    await agregarColumnaSegura(db, "nombre", "TEXT NOT NULL DEFAULT 'Usuario'");
    await agregarColumnaSegura(db, "creado_en", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
    await agregarColumnaSegura(
      db,
      "actualizado_en",
      "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
    );

    // Rellenar valores nulos/vacíos con defaults
    await db.exec(
      "UPDATE usuarios SET nombre = COALESCE(NULLIF(TRIM(nombre), ''), 'Usuario'), creado_en = COALESCE(NULLIF(creado_en, ''), datetime('now')), actualizado_en = COALESCE(NULLIF(actualizado_en, ''), datetime('now')) WHERE nombre IS NULL OR TRIM(nombre) = '' OR creado_en IS NULL OR creado_en = '' OR actualizado_en IS NULL OR actualizado_en = '';",
    );

    esquemaInicializado = true;
  } catch (error) {
    console.error("Error inicializando esquema usuarios:", error);
    throw error;
  }
};
