import { Hono } from "hono";
import { AuthController, type BindingsAuth } from "./AuthController";

export function crearAuthRouter() {
  const router = new Hono<{ Bindings: BindingsAuth }>();
  const controller = new AuthController();

  router.post("/login", (c) => controller.iniciarSesion(c));
  router.post("/refresh", (c) => controller.renovarSesion(c));

  return router;
}
