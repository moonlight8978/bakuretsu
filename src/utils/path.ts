import { homedir } from "os";
import { resolve } from "path";

export function expandPath(path: string) {
  if (!path) {
    return path;
  }

  if (path === "~") {
    return homedir();
  }

  if (path.startsWith("~/")) {
    return resolve(homedir(), path.slice(2));
  }

  return resolve(path);
}
