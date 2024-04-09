import getCLI from './cli.js';
import Context from './context.js';
import Github from './github.js';

export async function runCommandFromGithubAction(rawCommand) {
  // Trimming the command
  let cmd = rawCommand.trim();
  if (cmd.startsWith('\\@')) {
    cmd = cmd.replace('\\@', '@');
  }
  if (!cmd.startsWith('@supersetbot')) {
    console.error("ERROR: command should start with '@supersetbot'");
    process.exit(1);
  }

  const context = new Context('GHA');
  const cli = getCLI(context);
  const github = new Github(context);

  // Make rawCommand look like argv
  cmd = cmd.replace('@supersetbot', 'supersetbot');
  const args = context.parseArgs(cmd);

  await cli.parseAsync(['node', ...args]);
  const msg = await context.onDone();

  github.createComment(msg);
}
