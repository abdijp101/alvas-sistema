import { type UsuarioRespuestaDTO } from "../../application";
import { Usuario } from "../../domain/entities";

export type UsuarioPersistenciaRow = {
  id: string;
  nombre?: string;
  hash_clave: string;
  rol: string;
  estado: string;
  creado_en?: string;
  actualizado_en?: string;
};

export class UsuarioMapper {
  static aDominio(row: UsuarioPersistenciaRow): Usuario {
    const nombre = row.nombre && row.nombre.trim() ? row.nombre : row.id;
    const ahora = new Date().toISOString();
    const creadoEn = row.creado_en || ahora;
    const actualizadoEn = row.actualizado_en || ahora;

    return Usuario.reconstituir({
      id: row.id,
      nombre,
      hashClave: row.hash_clave,
      rol: row.rol,
      estado: row.estado,
      creadoEn,
      actualizadoEn,
    });
  }

  static aPersistencia(usuario: Usuario): UsuarioPersistenciaRow {
    return {
      id: usuario.id.valor,
      nombre: usuario.nombre.valor,
      hash_clave: usuario.hashClave,
      rol: usuario.rol.valor,
      estado: usuario.estado.valor,
      creado_en: usuario.creadoEn.toISOString(),
      actualizado_en: usuario.actualizadoEn.toISOString(),
    };
  }

  static aRespuesta(usuario: Usuario): UsuarioRespuestaDTO {
    return {
      id: usuario.id.valor,
      nombre: usuario.nombre.valor,
      rol: usuario.rol.valor,
      estado: usuario.estado.valor,
    };
  }
}
