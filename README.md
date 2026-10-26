# ECP frontend

## Frontend profile

Every project npm script accepts `--profile=dev` or `--profile=prod` after `--`:

```bash
npm run dev -- --profile=dev
npm run build -- --profile=dev
npm run start -- --profile=dev
npm run lint -- --profile=prod
```

The scripts also accept `ECP_FRONTEND_PROFILE=dev` or `prod`. Without either setting, an interactive terminal asks which profile to use; noninteractive runs default to `prod`. An explicit `--profile` takes priority over the environment variable. The selected profile is printed before the command starts. `NODE_ENV` remains controlled by Next.js: a `dev` frontend profile can be used with `next start` after building the app.

For a local seeded backend, run it with its `dev` Spring profile and set these private values in `.env.local` at the project root:

```dotenv
ECP_API_BASE_URL=http://localhost:8080/api/v1
ECP_DEMO_LOGIN_ENABLED=true
ECP_DEMO_PASSWORD=<backend seed password>
```

The dev-account sign-in design also requires the backend URL to be on the local/dev allowlist. The frontend currently contains the dev-account UI components but has not yet connected them to a login route or server action. Selecting `dev` prepares the server-side profile for that integration; it does not by itself expose or sign in those accounts. In `prod`, the script forces `ECP_DEMO_LOGIN_ENABLED=false`.

See the [frontend dev-account design](../docs/SolutionArchitecture/03-frontend/Component-Design/dev-account-login.md) and [integration plan](../docs/ProductManager/integration-plan.md) for the intended login and API configuration.

Open [http://localhost:3000](http://localhost:3000) after starting the development server.
