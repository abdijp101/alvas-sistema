import { ErrorDeDominio } from "../../../shared/domain";

export class AuthTokenInvalidoError extends ErrorDeDominio {
  constructor() {
    super("El auth token es invalido.", {
      codigo: "AUTH_TOKEN_INVALIDO",
    });
    this.name = "AuthTokenInvalidoError";
  }
}
