import { type ValorRolUsuario } from "../../../usuarios";
import { AuthToken, RefreshToken } from "../value-objects";

export type PayloadToken = {
  idUsuario: string;
  rol: ValorRolUsuario;
};

export interface ITokenProvider {
  generarAuthToken(payload: PayloadToken): Promise<AuthToken> | AuthToken;
  generarRefreshToken(payload: PayloadToken): Promise<RefreshToken> | RefreshToken;
  validarAuthToken(token: AuthToken): Promise<PayloadToken> | PayloadToken;
  validarRefreshToken(token: RefreshToken): Promise<PayloadToken> | PayloadToken;
}
