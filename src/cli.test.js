import { runShellCommand } from './utils';

beforeEach(() => {
  process.env.GITHUB_REPOSITORY = 'apache/superset';
});

afterEach(() => {
  delete process.env.GITHUB_REPOSITORY;
});

describe('CLI Test', () => {
  test.each([
    ['./src/supersetbot docker --preset dev --dry-run', '--target dev'],
    ['./src/supersetbot docker --dry-run', ' --target lean'],
  ])('returns %s for release %s', async (command, contains) => {
    const result = await runShellCommand({ command, exitOnError: false });
    const output = result.stdout.toString();
    expect(output).toContain(contains);
  });
});

describe('bake CLI', () => {
  const bakeFileOutput = 'test-bake-cli-output.json';

  afterEach(async () => {
    await runShellCommand({ command: `rm -f ${bakeFileOutput}`, exitOnError: false });
  });

  test('writes a bake file covering the default presets and dry-runs the bake command', async () => {
    const result = await runShellCommand({
      command: `./src/supersetbot bake --dry-run --output ${bakeFileOutput}`,
      exitOnError: false,
    });
    const output = result.stdout.toString();
    expect(output).toContain(`Wrote bake file to ${bakeFileOutput} covering: dev, lean, py311, py312`);
    expect(output).toContain(`dry-run: docker buildx bake -f ${bakeFileOutput}`);

    const bakeFile = JSON.parse(await (await import('node:fs')).promises.readFile(bakeFileOutput, 'utf8'));
    expect(Object.keys(bakeFile.target)).toEqual(['dev', 'lean', 'py311', 'py312']);
  });

  test('--presets narrows which targets get written', async () => {
    const result = await runShellCommand({
      command: `./src/supersetbot bake --dry-run --presets websocket dockerize --output ${bakeFileOutput}`,
      exitOnError: false,
    });
    const output = result.stdout.toString();
    expect(output).toContain(`Wrote bake file to ${bakeFileOutput} covering: websocket, dockerize`);
  });
});
