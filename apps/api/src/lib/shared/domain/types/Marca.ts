declare const simboloDeMarca: unique symbol;

export type Marca<TValor, TNombre extends string> = TValor & {
  readonly [simboloDeMarca]: TNombre;
};
