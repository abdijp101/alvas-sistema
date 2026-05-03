export type Exito<T> = {
  readonly esExito: true;
  readonly valor: T;
};

export type Fallo<E> = {
  readonly esExito: false;
  readonly error: E;
};

export type Resultado<T, E> = Exito<T> | Fallo<E>;

export const resultadoExitoso = <T>(valor: T): Exito<T> => ({
  esExito: true,
  valor,
});

export const resultadoFallido = <E>(error: E): Fallo<E> => ({
  esExito: false,
  error,
});
