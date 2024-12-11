import { BaseCommand, flags, Kernel, ListLoader } from "@adonisjs/ace";
import { CommandOptions } from "@adonisjs/ace/types";

import "@/polyfill/index";
import { BackupCommand } from "@/commands/backup.command";

export class App extends BaseCommand {
  static override commandName = "launch";
  static override description = "Bakuretsu app";
  static override options: CommandOptions = {
    allowUnknownFlags: true,
  };

  @flags.string({ description: "The action to perform" })
  declare action: string;

  override async run() {
    await this.#promptForAction();

    const app = Kernel.create();
    app.addLoader(new ListLoader([BackupCommand]));

    await app.handle([this.action, ...process.argv.slice(2)]);
  }

  async #promptForAction() {
    if (!this.action) {
      this.action = await this.prompt.choice("Action", [
        {
          name: "backup",
          message: "Backup",
        },
        {
          name: "restore",
          message: "Restore",
        },
      ]);
    }
  }
}
