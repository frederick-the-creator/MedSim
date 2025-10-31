<!-- 08143dd9-b643-48ee-9353-b35537ffb055 8b3d564a-9e96-4c50-a39b-dbf21dabbfbd -->
# Enable HTTPS for Local Mobile Dev (mkcert + Express + Vite middleware)

### 1) Certificates (mkcert) — already done

- You’ve generated certs for `localhost`, `127.0.0.1`, `::1`, and `192.168.0.28` and placed them at `certs/cert.pem` and `certs/key.pem`.
- No further action needed unless your LAN IP changes.

### 2) Use HTTPS only in local development (avoid deployment issues)

- Make server creation conditional in `server/routes.ts`:
```ts
// server/routes.ts
import type { Express } from "express";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express) {
  // ... route registrations ...
  const useLocalHttps = app.get("env") === "development" && process.env.LOCAL_HTTPS === "1";
  if (useLocalHttps) {
    const key = fs.readFileSync(path.resolve(import.meta.dirname, "..", "certs", "key.pem"));
    const cert = fs.readFileSync(path.resolve(import.meta.dirname, "..", "certs", "cert.pem"));
    return createHttpsServer({ key, cert }, app);
  }
  return createHttpServer(app);
}
```

- Run locally with `LOCAL_HTTPS=1` to enable HTTPS. In production, leave it unset so the app stays HTTP behind your platform’s TLS termination.
- In `server/index.ts`, add (once, near app init): `app.set('trust proxy', 1)` so `req.secure` and secure cookies work correctly behind proxies in prod.

### 3) Keep Vite middleware + HMR on the same server

- `server/vite.ts` is already using `middlewareMode: true` and `hmr: { server }`. No change needed; when HTTPS is active locally, HMR will use WSS on the same origin/port.

### 4) Vite config (tweak only if mobile HMR struggles)

- If needed, set explicit origin/HMR host for your LAN IP and port used by the Node server (e.g., 5000):
```ts
// vite.config.ts
server: {
  host: "0.0.0.0",
  origin: "https://192.168.0.28:5000",
  hmr: { protocol: "wss", host: "192.168.0.28", port: 5000 },
}
```


### 5) Dev run

- Start dev server as usual. To enable local HTTPS: `LOCAL_HTTPS=1 PORT=5000 npm run dev`.
- Connect from phone: `https://192.168.0.28:5000`.

### 6) Trust on mobile device

- If not yet done: `mkcert -CAROOT` to locate the root CA and install on the phone (iOS/Android steps as previously outlined).

### 7) Test and troubleshoot

- Page should load without cert warnings; HMR should reflect edits on the phone.
- If HMR fails, ensure the cert includes `192.168.0.28`, `LOCAL_HTTPS=1` is set, and apply the optional Vite `origin/hmr` settings if necessary.
- Ensure macOS firewall allows incoming connections on the chosen port and phone is on the same LAN.

### To-dos

- [ ] Switch to HTTPS in server/routes.ts using certs
- [ ] Test https from phone and confirm WSS HMR works
- [ ] If needed, set origin/hmr host+port in vite.config.ts
- [ ] Install/trust mkcert root CA on the phone if missing