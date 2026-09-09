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
    ['./src/supersetbot docker --preset superset --dry-run', '--target superset'],
    ['./src/supersetbot docker --preset lean --dry-run', '--target lean'],
    ['./src/supersetbot docker --dry-run', ' --target superset'],
  ])('returns %s for release %s', async (command, contains) => {
    const result = await runShellCommand({ command, exitOnError: false });
    const output = result.stdout.toString();
    expect(output).toContain(contains);
  });
});
