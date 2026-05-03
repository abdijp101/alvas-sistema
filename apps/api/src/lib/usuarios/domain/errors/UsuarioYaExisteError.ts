import { ErrorDeDominio } from "../../../shared/domain";

export class UsuarioYaExisteError extends ErrorDeDominio {
  constructor(idUsuario: string) {
    super("Ya existe un usuario con ese id.", {
      codigo: "USUARIO_YA_EXISTE",
      detalle: { idUsuario },
    });
    this.name = "UsuarioYaExisteError";
  }
}
