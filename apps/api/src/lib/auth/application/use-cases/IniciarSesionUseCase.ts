import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { IdUsuario, type IPasswordHasher, type IUsuarioRepository } from "../../../usuarios";
import { CredencialesInvalidasError } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";
import { type ITokenProvider } from "../ports";

export type IniciarSesionInput = {
  idUsuario: string;
  clave: string;
};

export class IniciarSesionUseCase
  implements CasoDeUso<IniciarSesionInput, Resultado<SesionAutenticadaDTO, ErrorDeDominio>>
{
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(input: IniciarSesionInput): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>> {
    try {
      const idUsuario = new IdUsuario(input.idUsuario);
      const clave = input.clave.trim();

      if (!clave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const usuario = await this.usuarioRepository.obtenerPorId(idUsuario);

      if (!usuario || usuario.estado.estaDeshabilitado()) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const coincideClave = await this.passwordHasher.comparar(clave, usuario.hashClave.valor);

      if (!coincideClave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const payload = {
        idUsuario: usuario.id.valor,
        rol: usuario.rol.valor,
      };
      const authToken = await this.tokenProvider.generarAuthToken(payload);
      const refreshToken = await this.tokenProvider.generarRefreshToken(payload);

      return resultadoExitoso({
        authToken: authToken.valor,
        refreshToken: refreshToken.valor,
        usuario: {
          id: payload.idUsuario,
          rol: payload.rol,
        },
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}
