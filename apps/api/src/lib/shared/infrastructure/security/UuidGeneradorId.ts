import { v4 as uuidv4 } from "uuid";
import { type IGeneradorId } from "../../domain/ports/IGeneradorId";

export class UuidGeneradorId implements IGeneradorId {
  generar(): string {
    return uuidv4();
  }
}
