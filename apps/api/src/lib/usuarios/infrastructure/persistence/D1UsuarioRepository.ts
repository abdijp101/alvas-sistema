import { type D1DatabaseLike } from "../../../shared";
import { Usuario } from "../../domain/entities";
import { type IUsuarioRepository } from "../../domain/ports";
import { EstadoUsuario, IdUsuario } from "../../domain/value-objects";
import { asegurarEsquemaUsuarios } from "./schema";

type UsuarioRow = {
  id: string;
  hash_clave: string;
  rol: string;
  estado: string;
};

export class D1UsuarioRepository implements IUsuarioRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async obtenerPorId(id: IdUsuario): Promise<Usuario | null> {
    await asegurarEsquemaUsuarios(this.db);

    const row = await this.db
      .prepare("SELECT id, hash_clave, rol, estado FROM usuarios WHERE id = ?1")
      .bind(id.valor)
      .first<UsuarioRow>();

    if (!row) {
      return null;
    }

    return Usuario.crear({
      id: row.id,
      hashClave: row.hash_clave,
      rol: row.rol,
      estado: row.estado,
    });
  }

  async existePorId(id: IdUsuario): Promise<boolean> {
    await asegurarEsquemaUsuarios(this.db);

    const row = await this.db
      .prepare("SELECT id FROM usuarios WHERE id = ?1")
      .bind(id.valor)
      .first<{ id: string }>();

    return !!row;
  }

  async guardar(usuario: Usuario): Promise<void> {
    await asegurarEsquemaUsuarios(this.db);

    await this.db
      .prepare(
        `
          INSERT INTO usuarios (id, hash_clave, rol, estado, creado_en, actualizado_en)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6)
          ON CONFLICT(id) DO UPDATE SET
            hash_clave = excluded.hash_clave,
            rol = excluded.rol,
            estado = excluded.estado,
            actualizado_en = excluded.actualizado_en
        `,
      )
      .bind(
        usuario.id.valor,
        usuario.hashClave,
        usuario.rol.valor,
        usuario.estado.valor,
        usuario.creadoEn.toISOString(),
        usuario.actualizadoEn.toISOString(),
      )
      .run();
  }

  async eliminarPorId(id: IdUsuario): Promise<void> {
    await asegurarEsquemaUsuarios(this.db);
    await this.db.prepare("DELETE FROM usuarios WHERE id = ?1").bind(id.valor).run();
  }

  async listarTodos(): Promise<Usuario[]> {
    await asegurarEsquemaUsuarios(this.db);

    const query = await this.db
      .prepare("SELECT id, hash_clave, rol, estado FROM usuarios ORDER BY id ASC")
      .all<UsuarioRow>();

    return query.results.map((row) =>
      Usuario.crear({
        id: row.id,
        hashClave: row.hash_clave,
        rol: row.rol,
        estado: row.estado,
      }),
    );
  }

  async deshabilitarPorId(id: IdUsuario): Promise<void> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      return;
    }

    usuario.deshabilitar();
    await this.guardar(usuario);
  }

  async actualizarRol(id: IdUsuario, nuevoRol: string): Promise<void> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      return;
    }

    usuario.cambiarRol(nuevoRol);
    await this.guardar(usuario);
  }

  async actualizarHashClave(id: IdUsuario, nuevoHash: string): Promise<void> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      return;
    }

    usuario.cambiarHashClave(nuevoHash);
    await this.guardar(usuario);
  }

  async crearUsuario(id: string, hashClave: string, rol: string): Promise<Usuario> {
    const usuario = Usuario.crear({
      id,
      hashClave,
      rol,
      estado: EstadoUsuario.activo().valor,
    });

    await this.guardar(usuario);
    return usuario;
  }
}
