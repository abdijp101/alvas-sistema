import { ErrorDeValidacion } from "../../../shared/domain";
import { type IPasswordHasher } from "../../../usuarios/application/ports";
import { HashClave } from "../../../usuarios/domain/value-objects";

const ITERACIONES_PBKDF2 = 120_000;
const LARGO_HASH_BYTES = 32;
const LARGO_SALT_BYTES = 16;

const codificador = new TextEncoder();

const aBase64Url = (bytes: Uint8Array): string => {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const desdeBase64Url = (valor: string): Uint8Array => {
  const base64 = valor.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  const normalizado = padding ? `${base64}${"=".repeat(4 - padding)}` : base64;
  const binario = atob(normalizado);
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
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

export class Pbkdf2PasswordHasher implements IPasswordHasher {
  constructor(private readonly pepper: string = "") {}

  async hashear(clavePlana: string): Promise<HashClave> {
    const claveNormalizada = clavePlana.trim();

    if (claveNormalizada.length < 8) {
      throw new ErrorDeValidacion("La clave debe tener al menos 8 caracteres.");
    }

    const salt = crypto.getRandomValues(new Uint8Array(LARGO_SALT_BYTES));
    const hash = await this.derivarHash(claveNormalizada, salt, ITERACIONES_PBKDF2);

    return new HashClave(`pbkdf2$${ITERACIONES_PBKDF2}$${aBase64Url(salt)}$${aBase64Url(hash)}`);
  }

  async comparar(clavePlana: string, hashGuardado: string): Promise<boolean> {
    const partes = hashGuardado.split("$");

    if (partes.length !== 4 || partes[0] !== "pbkdf2") {
      return false;
    }

    const [, iteracionesStr, saltStr, hashEsperado] = partes;

    if (!iteracionesStr || !saltStr || !hashEsperado) {
      return false;
    }

    const iteraciones = Number(iteracionesStr);
    const salt = desdeBase64Url(saltStr);

    if (!Number.isFinite(iteraciones) || iteraciones <= 0) {
      return false;
    }

    const hashCalculado = await this.derivarHash(clavePlana.trim(), salt, iteraciones);
    return compararSeguro(aBase64Url(hashCalculado), hashEsperado);
  }

  private async derivarHash(
    clavePlana: string,
    salt: Uint8Array,
    iteraciones: number,
  ): Promise<Uint8Array> {
    const material = await crypto.subtle.importKey(
      "raw",
      codificador.encode(`${clavePlana}${this.pepper}`),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        iterations: iteraciones,
        salt: salt as unknown as BufferSource,
      },
      material,
      LARGO_HASH_BYTES * 8,
    );

    return new Uint8Array(bits);
  }
}
