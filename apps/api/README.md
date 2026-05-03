# api

Backend base de ALVAS para evolucionar por modulos DDD + Hexagonal.

## Comandos

```bash
bun install
bun run dev
bun test
```

## Endpoints base

- `GET /health`
- `POST /usuarios` crea usuario base para pruebas
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me` (requiere bearer token)

## Flujo rapido de prueba local

Crear usuario:

```bash
curl -X POST http://127.0.0.1:8787/usuarios ^
  -H "Content-Type: application/json" ^
  -d "{\"idUsuario\":\"admin01\",\"clave\":\"ClaveSegura123\",\"rol\":\"ADMIN\"}"
```

Login:

```bash
curl -X POST http://127.0.0.1:8787/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"idUsuario\":\"admin01\",\"clave\":\"ClaveSegura123\"}"
```

Refresh:

```bash
curl -X POST http://127.0.0.1:8787/auth/refresh ^
  -H "Content-Type: application/json" ^
  -d "{\"refreshToken\":\"<token-refresh>\"}"
```

Perfil:

```bash
curl http://127.0.0.1:8787/auth/me ^
  -H "Authorization: Bearer <token-auth>"
```
