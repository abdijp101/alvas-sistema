import { Hono } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { IdUsuario, Usuario, UsuarioYaExisteError } from "../../domain";
import { D1UsuarioRepository } from "../persistence/D1UsuarioRepository";
import { Pbkdf2PasswordHasher } from "../security/Pbkdf2PasswordHasher";

type BindingsUsuarios = {
  DB: D1DatabaseLike;
  AUTH_PEPPER?: string;
};

type CrearUsuarioRequest = {
  idUsuario: string;
  clave: string;
  rol: string;
};

export const crearUsuarioController = () => {
  const router = new Hono<{ Bindings: BindingsUsuarios }>();

  router.post("/", async (c) => {
    try {
      const body = await c.req.json<CrearUsuarioRequest>();
      const repo = new D1UsuarioRepository(c.env.DB);
      const idUsuario = body.idUsuario.trim();
      const id = new IdUsuario(idUsuario);

      const passwordHasher = new Pbkdf2PasswordHasher(c.env.AUTH_PEPPER);
      const hashClave = await passwordHasher.hashear(body.clave);
      const usuario = Usuario.crear({
        id: id.valor,
        hashClave,
        rol: body.rol,
      });

      if (await repo.existePorId(usuario.id)) {
        throw new UsuarioYaExisteError(usuario.id.valor);
      }

      await repo.guardar(usuario);

      return c.json(
        {
          success: true,
          data: {
            id: usuario.id.valor,
            rol: usuario.rol.valor,
            estado: usuario.estado.valor,
          },
        },
        201,
      );
    } catch (error) {
      if (error instanceof UsuarioYaExisteError) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 409);
      }

      if (error instanceof ErrorDeDominio) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 400);
      }

      return c.json({ success: false, message: "Error interno al crear usuario." }, 500);
    }
  });

  return router;
};
