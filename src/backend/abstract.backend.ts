import { MatchConfig } from "@/utils/config";

export abstract class AbstractBackend {
  declare dryRun: boolean;

  abstract getFile(path: string): Promise<string>;

  abstract ls(match: MatchConfig): Promise<string[]>;

  abstract syncDir(dir: string): Promise<void>;

  abstract finalize(options: { tmpDir: string }): Promise<void>;
}
