import { AuthTokenInvalidoError, RefreshTokenInvalidoError, type ITokenProvider, type PayloadToken } from "../../domain";
import { AuthToken, RefreshToken } from "../../domain/value-objects";

type TipoToken = "auth" | "refresh";

type TokenPayload = PayloadToken & {
  tipo: TipoToken;
  exp: number;
};

type HmacTokenProviderParams = {
  authSecret: string;
  refreshSecret?: string;
  authTokenTtlSegundos?: number;
  refreshTokenTtlSegundos?: number;
};

const codificador = new TextEncoder();

const base64UrlEncode = (valor: string): string =>
  btoa(valor).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const base64UrlDecode = (valor: string): string => {
  const normalizado = valor.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalizado.length % 4;
  const valorPadded = padding ? `${normalizado}${"=".repeat(4 - padding)}` : normalizado;
  return atob(valorPadded);
};

const compararSeguro = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let acumulado = 0;

  for (let i = 0; i < a.length; i += 1) {
    acumulado |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return acumulado === 0;
};

export class HmacTokenProvider implements ITokenProvider {
  private readonly refreshSecret: string;
  private readonly authTokenTtlSegundos: number;
  private readonly refreshTokenTtlSegundos: number;

  constructor(private readonly params: HmacTokenProviderParams) {
    this.refreshSecret = params.refreshSecret ?? params.authSecret;
    this.authTokenTtlSegundos = params.authTokenTtlSegundos ?? 900;
    this.refreshTokenTtlSegundos = params.refreshTokenTtlSegundos ?? 60 * 60 * 24 * 7;
  }

  async generarAuthToken(payload: PayloadToken): Promise<AuthToken> {
    const token = await this.firmar(payload, this.params.authSecret, "auth", this.authTokenTtlSegundos);
    return new AuthToken(token);
  }

  async generarRefreshToken(payload: PayloadToken): Promise<RefreshToken> {
    const token = await this.firmar(
      payload,
      this.refreshSecret,
      "refresh",
      this.refreshTokenTtlSegundos,
    );
    return new RefreshToken(token);
  }

  async validarAuthToken(token: AuthToken): Promise<PayloadToken> {
    return this.validar(token.valor, this.params.authSecret, "auth");
  }

  async validarRefreshToken(token: RefreshToken): Promise<PayloadToken> {
    return this.validar(token.valor, this.refreshSecret, "refresh");
  }

  private async firmar(
    payload: PayloadToken,
    secret: string,
    tipo: TipoToken,
    ttlSegundos: number,
  ): Promise<string> {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = base64UrlEncode(
      JSON.stringify({
        ...payload,
        tipo,
        exp: Math.floor(Date.now() / 1000) + ttlSegundos,
      }),
    );
    const firma = await this.generarFirma(`${header}.${body}`, secret);

    return `${header}.${body}.${firma}`;
  }

  private async validar(token: string, secret: string, tipoEsperado: TipoToken): Promise<PayloadToken> {
    const partes = token.split(".");

    if (partes.length !== 3) {
      throw tipoEsperado === "auth" ? new AuthTokenInvalidoError() : new RefreshTokenInvalidoError();
    }

    const header = partes[0];
    const body = partes[1];
    const firmaRecibida = partes[2];

    if (!header || !body || !firmaRecibida) {
      throw tipoEsperado === "auth" ? new AuthTokenInvalidoError() : new RefreshTokenInvalidoError();
    }

    const firmaEsperada = await this.generarFirma(`${header}.${body}`, secret);

    if (!compararSeguro(firmaRecibida, firmaEsperada)) {
      throw tipoEsperado === "auth" ? new AuthTokenInvalidoError() : new RefreshTokenInvalidoError();
    }

    const payload = JSON.parse(base64UrlDecode(body)) as TokenPayload;

    if (
      payload.tipo !== tipoEsperado ||
      !payload.idUsuario ||
      !payload.rol ||
      !payload.exp ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw tipoEsperado === "auth" ? new AuthTokenInvalidoError() : new RefreshTokenInvalidoError();
    }

    return {
      idUsuario: payload.idUsuario,
      rol: payload.rol,
    };
  }

  private async generarFirma(contenido: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      "raw",
      codificador.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, codificador.encode(contenido));
    return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  }
}
