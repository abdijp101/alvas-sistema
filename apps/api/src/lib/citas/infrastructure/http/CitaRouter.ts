import { Hono } from "hono";
import { CitaController, type BindingsCitas } from "./CitaController";

const citaRouter = new Hono<{ Bindings: BindingsCitas }>();
const controller = new CitaController();

citaRouter.get("/", (c) => controller.listar(c));
citaRouter.post("/", (c) => controller.crear(c));

export { citaRouter };
