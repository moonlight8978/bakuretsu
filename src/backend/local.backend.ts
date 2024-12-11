import { readFileSync, rmSync } from "fs";
import { glob } from "glob";

import { expandPath } from "@/utils/path";
import { MatchConfig } from "@/utils/config";
import { Logger } from "@/types/index";
import { AbstractBackend } from "./abstract.backend.js";
import { execa } from "execa";

export class LocalBackend extends AbstractBackend {
  constructor(private logger: Logger) {
    super();
  }

  override async finalize(options: { tmpDir: string }): Promise<void> {
    await execa({
      cwd: options.tmpDir,
    })`zip -r backup.zip .`;
    await execa({
      cwd: options.tmpDir,
    })`mv backup.zip ..`;

    rmSync(options.tmpDir, { recursive: true });
  }

  override async syncDir(dir: string) {
    this.logger.info(`Syncing ${dir}...`);
  }

  override async ls(match: MatchConfig): Promise<string[]> {
    const ignores = match.patterns
      .filter((m) => m.startsWith("!"))
      .map((m) => expandPath(m.slice(1)));
    const patterns = match.patterns
      .filter((m) => !m.startsWith("!"))
      .map((m) => expandPath(m));
    return glob(patterns, { ignore: ignores, nodir: true });
  }

  override async getFile(path: string): Promise<string> {
    return readFileSync(expandPath(path), "utf-8");
  }
}
