import { HelpCommand, Kernel } from "@adonisjs/ace";
import { App } from "@/app";

const main = async () => {
  Kernel.defaultCommand = App;

  const kernel = Kernel.create();

  kernel.defineFlag("help", {
    type: "boolean",
    description: HelpCommand.description,
  });

  kernel.on("help", async (command, $kernel, options) => {
    options.args.unshift(command.commandName);
    await new HelpCommand($kernel, options, kernel.ui, kernel.prompt).exec();
    return true;
  });

  await kernel.handle(process.argv.slice(2));
};

main();
