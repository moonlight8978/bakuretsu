import { AbstractBackend } from "@/backend/abstract.backend";
import { LocalBackend } from "@/backend/local.backend";
import { loadConfig } from "@/utils/config";
import { expandPath } from "@/utils/path";
import { BaseCommand, flags } from "@adonisjs/ace";
import { CommandOptions } from "@adonisjs/ace/types";
import { execa } from "execa";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { cwd } from "process";
import { v4 as uuid } from "uuid";

export class BackupCommand extends BaseCommand {
  static override commandName = "backup";
  static override description = "Backup the configurations and secrets";
  static override options: CommandOptions = {
    allowUnknownFlags: true,
  };

  @flags.string({ description: "The PGP key to use for encryption" })
  declare pgp?: string;

  @flags.string({ description: "The path to store the backup" })
  declare path?: string;

  @flags.string({
    description: "The backend to use for storage",
    required: true,
  })
  declare backend: string;

  @flags.boolean({
    description: "Perform a dry run without writing to the backend",
    default: false,
  })
  declare dryRun: boolean;

  @flags.string({
    description: "Path to configuration file",
    default: "config.yml",
  })
  declare configFilePath: string;

  override async run() {
    this.logger.info("Backing up the database...");
    const backend = this.getBackend();
    backend.dryRun = this.dryRun;

    const configs = loadConfig(await backend.getFile(this.configFilePath));

    const { stdout: sopsBinaryPath } = await execa`which sops`;

    const tmp = join(cwd(), "tmp", uuid());

    await Promise.sequence(Object.entries(configs), async (entry) => {
      const [name, config] = entry;
      this.logger.info(`Backing up ${name}...`);

      await Promise.parallel(config.matches, async (match) => {
        const files = await backend.ls(match);
        const root = Buffer.from(match.root).toString("base64");

        await Promise.sequence(files, async (file) => {
          const tmpOutput = join(
            tmp,
            name,
            root,
            file.replace(expandPath(match.root), "")
          );

          mkdirSync(dirname(tmpOutput), { recursive: true });
          if (config.encrypted) {
            await execa({
              env: {
                SOPS_PGP_FP: this.pgp,
              },
              stdout: {
                file: tmpOutput,
              },
            })`${sopsBinaryPath} encrypt ${file}`;
          } else {
            await execa`cp ${file} ${tmpOutput}`;
          }

          return tmpOutput;
        });

        await backend.syncDir(join(tmp, name, root));
      });
    });

    await backend.finalize({ tmpDir: tmp });
  }

  getBackend(): AbstractBackend {
    switch (this.backend) {
      case "local":
        return new LocalBackend(this.logger);

      default:
        throw new Error(`Unknown backend: ${this.backend}`);
    }
  }
}
