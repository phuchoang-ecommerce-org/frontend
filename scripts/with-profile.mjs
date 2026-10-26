import { spawn } from "node:child_process";
import { constants } from "node:os";
import { createInterface } from "node:readline/promises";

const profiles = new Set(["dev", "prod"]);
const args = process.argv.slice(2);
const command = args.shift();

if (!command) {
  console.error("Usage: with-profile <command> [args] [--profile=dev|prod]");
  process.exit(2);
}

let selectedProfile;
let hasProfileFlag = false;
const commandArgs = [];

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === "--profile" || argument.startsWith("--profile=")) {
    if (hasProfileFlag) {
      console.error("Specify --profile only once.");
      process.exit(2);
    }
    hasProfileFlag = true;
    selectedProfile =
      argument === "--profile" ? args[++index] : argument.slice(10);
    if (!selectedProfile) {
      console.error("Missing value for --profile. Use dev or prod.");
      process.exit(2);
    }
  } else {
    commandArgs.push(argument);
  }
}

if (selectedProfile === undefined) {
  selectedProfile = process.env.ECP_FRONTEND_PROFILE;
}

if (selectedProfile === undefined) {
  if (process.stdin.isTTY && process.stdout.isTTY) {
    const prompt = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      const answer = await prompt.question(
        "Frontend profile ([1] prod, [2] dev) [1]: ",
      );
      const choice = answer.trim();
      selectedProfile =
        choice === "2"
          ? "dev"
          : choice === "1" || choice === ""
            ? "prod"
            : choice;
    } finally {
      prompt.close();
    }
  } else {
    selectedProfile = "prod";
  }
}

if (!profiles.has(selectedProfile)) {
  console.error(
    `Invalid frontend profile: ${selectedProfile ?? "(missing)"}. Use dev or prod.`,
  );
  process.exit(2);
}

const env = { ...process.env, ECP_FRONTEND_PROFILE: selectedProfile };
if (selectedProfile === "prod") {
  env.ECP_DEMO_LOGIN_ENABLED = "false";
}

console.log(`Frontend profile: ${selectedProfile}`);

const child = spawn(command, commandArgs, {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = signal ? 128 + constants.signals[signal] : (code ?? 1);
});
