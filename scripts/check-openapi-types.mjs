import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const spec = resolve(root, "../docs/SolutionArchitecture/04-shared/OpenAPI/openapi.yaml");
const checkedIn = resolve(root, "src/lib/api/types.ts");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "ecp-openapi-"));
const generated = join(temporaryDirectory, "types.ts");

try {
  const executable = resolve(root, "node_modules/.bin/openapi-typescript");
  const result = spawnSync(executable, [spec, "-o", generated], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || "OpenAPI type generation failed.\n");
    process.exitCode = result.status ?? 1;
  } else {
    const [expected, actual] = await Promise.all([
      readFile(checkedIn, "utf8"),
      readFile(generated, "utf8"),
    ]);
    if (expected !== actual) {
      process.stderr.write(
        "Generated OpenAPI types are stale. Run `npm run contract:generate` and commit the result.\n",
      );
      process.exitCode = 1;
    } else {
      process.stdout.write("Generated OpenAPI types match the contract.\n");
    }
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
