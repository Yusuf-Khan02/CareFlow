import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

function findTests(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findTests(fullPath));
    } else if (file.endsWith(".test.ts")) {
      results.push(fullPath.replace(/\\/g, "/"));
    }
  }
  return results;
}

const testFiles = findTests("tests");
if (testFiles.length === 0) {
  console.log("No test files found.");
  process.exit(0);
}

const isWin = process.platform === "win32";
const npxBin = isWin ? "npx.cmd" : "npx";
const result = spawnSync(npxBin, ["tsx", "--test", ...testFiles], { stdio: "inherit", shell: isWin });
process.exit(result.status ?? 1);
