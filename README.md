# ECP frontend

## Frontend profile

```bash
npm run dev 
npm run build
npm run build-webpack
npm run start
npm run lint 
```

Choose the dev or prod profile.

For a local seeded backend, run it with its `dev` Spring profile and set these private values in `.env.local` at the project root:

```dotenv
ECP_API_BASE_URL=http://localhost:8080/api/v1
ECP_DEMO_LOGIN_ENABLED=true
ECP_DEMO_PASSWORD=<backend seed password>
```

The dev-account sign-in panel appears on `/login` only when the frontend profile is `dev`, demo login is enabled, and the backend URL is on the local/dev allowlist. Its server action checks the same gate. In `prod`, the script forces `ECP_DEMO_LOGIN_ENABLED=false`; the panel is omitted from the login page and from the Vite-built Storybook preview. Stop an existing dev server before switching profiles so `localhost:3000` serves the selected profile.

See the [frontend dev-account design](../docs/SolutionArchitecture/03-frontend/Component-Design/dev-account-login.md) and [integration plan](../docs/ProductManager/integration-plan.md) for the intended login and API configuration.

Open [http://localhost:3000](http://localhost:3000) after starting the development server.

## F1 contract and architecture gates

The frontend consumes the normative contract at
`../docs/SolutionArchitecture/04-shared/OpenAPI/openapi.yaml`.

```bash
npm run contract:generate # refresh src/lib/api/types.ts
npm run contract:check    # fail when checked-in types drift
npm run mock:api          # Prism on http://127.0.0.1:4010
npm run check             # contract, types, lint, boundaries, and unit tests
```

Point `ECP_API_BASE_URL` at `http://127.0.0.1:4010` to render against Prism,
or at `http://localhost:8080/api/v1` to use the real API. Both paths use the
same server-only backend client.
