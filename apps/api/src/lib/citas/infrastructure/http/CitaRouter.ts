import { Hono } from "hono";
import { CitaController, type BindingsCitas } from "./CitaController";
import { verifyTokenMiddleware } from "../../../auth/infrastructure/http/middlewares/VerifyTokenMiddleware";
import { type PayloadToken } from "../../../auth/application";

const citaRouter = new Hono<{ 
  Bindings: BindingsCitas;
  Variables: { authPayload: PayloadToken };
}>();
const controller = new CitaController();

// Todas las rutas de citas requieren autenticación
citaRouter.use("*", verifyTokenMiddleware());

citaRouter.get("/", (c) => controller.listar(c));
citaRouter.post("/", (c) => controller.crear(c));

export { citaRouter };
