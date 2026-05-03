import { eq } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { Usuario } from "../../domain/entities";
import { type IUsuarioRepository } from "../../application/ports";
import { EstadoUsuario, IdUsuario } from "../../domain/value-objects";
import { obtenerDb } from "./drizzle";
import { usuariosTable, type UsuarioRow } from "./schema";
import { UsuarioMapper } from "./UsuarioMapper";

export class D1UsuarioRepository implements IUsuarioRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  async obtenerPorId(id: IdUsuario): Promise<Usuario | null> {
    try {
      const row = await this.drizzle()
        .select()
        .from(usuariosTable)
        .where(eq(usuariosTable.id, id.valor))
        .get();

      if (!row) {
        return null;
      }

      return UsuarioMapper.aDominio(row as UsuarioRow);
    } catch (error) {
      console.error(`Error obtenerPorId(${id.valor}):`, error);
      throw error;
    }
  }

  async existePorId(id: IdUsuario): Promise<boolean> {
    try {
      const row = await this.drizzle()
        .select({ id: usuariosTable.id })
        .from(usuariosTable)
        .where(eq(usuariosTable.id, id.valor))
        .get();

      return !!row;
    } catch (error) {
      console.error(`Error existePorId(${id.valor}):`, error);
      throw error;
    }
  }

  async guardar(usuario: Usuario): Promise<void> {
    try {
      const ahora = new Date().toISOString();
      const usuarioPersistencia = UsuarioMapper.aPersistencia(usuario);

      await this.drizzle()
        .insert(usuariosTable)
        .values({
          id: usuarioPersistencia.id,
          nombre: usuarioPersistencia.nombre,
          hashClave: usuarioPersistencia.hashClave,
          rol: usuarioPersistencia.rol,
          estado: usuarioPersistencia.estado,
          creadoEn: usuarioPersistencia.creadoEn,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: usuariosTable.id,
          set: {
            nombre: usuarioPersistencia.nombre,
            hashClave: usuarioPersistencia.hashClave,
            rol: usuarioPersistencia.rol,
            estado: usuarioPersistencia.estado,
            actualizadoEn: ahora,
          },
        });
    } catch (error) {
      console.error(`Error guardar usuario(${usuario.id.valor}):`, error);
      throw error;
    }
  }

  async eliminarPorId(id: IdUsuario): Promise<void> {
    try {
      await this.drizzle()
        .delete(usuariosTable)
        .where(eq(usuariosTable.id, id.valor));
    } catch (error) {
      console.error(`Error eliminarPorId(${id.valor}):`, error);
      throw error;
    }
  }

  async listarTodos(): Promise<Usuario[]> {
    try {
      const rows = await this.drizzle()
        .select()
        .from(usuariosTable)
        .orderBy(usuariosTable.id);

      return rows.map((row) => UsuarioMapper.aDominio(row as UsuarioRow));
    } catch (error) {
      console.error("Error listarTodos:", error);
      throw error;
    }
  }

  async deshabilitarPorId(id: IdUsuario): Promise<void> {
    try {
      const usuario = await this.obtenerPorId(id);

      if (!usuario) {
        return;
      }

      usuario.deshabilitar();
      await this.guardar(usuario);
    } catch (error) {
      console.error(`Error deshabilitarPorId(${id.valor}):`, error);
      throw error;
    }
  }

  async actualizarRol(id: IdUsuario, nuevoRol: string): Promise<void> {
    try {
      const usuario = await this.obtenerPorId(id);

      if (!usuario) {
        return;
      }

      usuario.cambiarRol(nuevoRol);
      await this.guardar(usuario);
    } catch (error) {
      console.error(`Error actualizarRol(${id.valor}):`, error);
      throw error;
    }
  }

  async actualizarHashClave(id: IdUsuario, nuevoHash: string): Promise<void> {
    try {
      const usuario = await this.obtenerPorId(id);

      if (!usuario) {
        return;
      }

      usuario.cambiarHashClave(nuevoHash);
      await this.guardar(usuario);
    } catch (error) {
      console.error(`Error actualizarHashClave(${id.valor}):`, error);
      throw error;
    }
  }

  async crearUsuario(id: string, nombre: string, hashClave: string, rol: string): Promise<Usuario> {
    try {
      const usuario = Usuario.crear({
        id,
        nombre,
        hashClave,
        rol,
        estado: EstadoUsuario.activo().valor,
      });

      await this.guardar(usuario);
      return usuario;
    } catch (error) {
      console.error(`Error crearUsuario(${id}):`, error);
      throw error;
    }
  }
}
