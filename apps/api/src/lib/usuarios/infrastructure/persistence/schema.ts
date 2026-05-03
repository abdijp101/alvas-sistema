import { type D1DatabaseLike } from "../../../shared";

const SQL_CREAR_TABLA_USUARIOS = `CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, hash_clave TEXT NOT NULL, rol TEXT NOT NULL, estado TEXT NOT NULL, creado_en TEXT NOT NULL, actualizado_en TEXT NOT NULL);`;

let esquemaInicializado = false;

export const asegurarEsquemaUsuarios = async (db: D1DatabaseLike): Promise<void> => {
  if (esquemaInicializado) {
    return;
  }

  await db.exec(SQL_CREAR_TABLA_USUARIOS);
  esquemaInicializado = true;
};
