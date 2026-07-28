import { jest } from '@jest/globals';
import * as dockerUtils from './docker.js';

const SHA = '22e7c602b9aa321ec7e0df4bb0033048664dcdf0';
const PR_ID = '666';
const OLD_REL = '2.1.0';
const NEW_REL = '2.1.1';
const REPO = 'apache/superset';

jest.mock('./github.js', () => jest.fn().mockImplementation(() => NEW_REL));

beforeEach(() => {
  process.env.TEST_ENV = 'true';
  process.env.DOCKERHUB_TOKEN = 'dummy';
  process.env.GITHUB_RUN_ID = '123';
});

afterEach(() => {
  delete process.env.TEST_ENV;
});

describe('getDockerTags', () => {
  test.each([
    // PRs
    [
      'lean',
      ['linux/arm64'],
      SHA,
      'pull_request',
      PR_ID,
      false,
      [`${REPO}:22e7c60-arm`, `${REPO}:${SHA}-arm`, `${REPO}:pr-${PR_ID}-arm`],
    ],
    [
      'ci',
      ['linux/amd64'],
      SHA,
      'pull_request',
      PR_ID,
      false,
      [`${REPO}:22e7c60-ci`, `${REPO}:${SHA}-ci`, `${REPO}:pr-${PR_ID}-ci`],
    ],
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'pull_request',
      PR_ID,
      false,
      [`${REPO}:22e7c60`, `${REPO}:${SHA}`, `${REPO}:pr-${PR_ID}`],
    ],
    [
      'dev',
      ['linux/arm64'],
      SHA,
      'pull_request',
      PR_ID,
      false,
      [
        `${REPO}:22e7c60-dev-arm`,
        `${REPO}:${SHA}-dev-arm`,
        `${REPO}:pr-${PR_ID}-dev-arm`,
      ],
    ],
    [
      'dev',
      ['linux/amd64'],
      SHA,
      'pull_request',
      PR_ID,
      false,
      [`${REPO}:22e7c60-dev`, `${REPO}:${SHA}-dev`, `${REPO}:pr-${PR_ID}-dev`, `${REPO}:GHA-123`],
    ],
    // old releases
    [
      'lean',
      ['linux/arm64'],
      SHA,
      'release',
      OLD_REL,
      false,
      [`${REPO}:22e7c60-arm`, `${REPO}:${SHA}-arm`, `${REPO}:${OLD_REL}-arm`],
    ],
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'release',
      OLD_REL,
      false,
      [`${REPO}:22e7c60`, `${REPO}:${SHA}`, `${REPO}:${OLD_REL}`],
    ],
    [
      'dev',
      ['linux/arm64'],
      SHA,
      'release',
      OLD_REL,
      false,
      [
        `${REPO}:22e7c60-dev-arm`,
        `${REPO}:${SHA}-dev-arm`,
        `${REPO}:${OLD_REL}-dev-arm`,
      ],
    ],
    [
      'dev',
      ['linux/amd64'],
      SHA,
      'release',
      OLD_REL,
      false,
      [`${REPO}:22e7c60-dev`, `${REPO}:${SHA}-dev`, `${REPO}:${OLD_REL}-dev`],
    ],
    // new releases
    [
      'lean',
      ['linux/arm64'],
      SHA,
      'release',
      NEW_REL,
      false,
      [
        `${REPO}:22e7c60-arm`,
        `${REPO}:${SHA}-arm`,
        `${REPO}:${NEW_REL}-arm`,
        `${REPO}:latest-arm`,
      ],
    ],
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'release',
      NEW_REL,
      false,
      [`${REPO}:22e7c60`, `${REPO}:${SHA}`, `${REPO}:${NEW_REL}`, `${REPO}:latest`],
    ],
    [
      'dev',
      ['linux/arm64'],
      SHA,
      'release',
      NEW_REL,
      false,
      [
        `${REPO}:22e7c60-dev-arm`,
        `${REPO}:${SHA}-dev-arm`,
        `${REPO}:${NEW_REL}-dev-arm`,
        `${REPO}:latest-dev-arm`,
      ],
    ],
    [
      'dev',
      ['linux/amd64'],
      SHA,
      'release',
      NEW_REL,
      false,
      [
        `${REPO}:22e7c60-dev`,
        `${REPO}:${SHA}-dev`,
        `${REPO}:${NEW_REL}-dev`,
        `${REPO}:latest-dev`,
      ],
    ],
    // merge on master
    [
      'lean',
      ['linux/arm64'],
      SHA,
      'push',
      'master',
      false,
      [`${REPO}:22e7c60-arm`, `${REPO}:${SHA}-arm`, `${REPO}:master-arm`],
    ],
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      false,
      [`${REPO}:22e7c60`, `${REPO}:${SHA}`, `${REPO}:master`],
    ],
    [
      'dev',
      ['linux/arm64'],
      SHA,
      'push',
      'master',
      false,
      [
        `${REPO}:22e7c60-dev-arm`,
        `${REPO}:${SHA}-dev-arm`,
        `${REPO}:master-dev-arm`,
      ],
    ],
    [
      'dev',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      false,
      [`${REPO}:22e7c60-dev`, `${REPO}:${SHA}-dev`, `${REPO}:master-dev`],
    ],

    [
      'lean',
      ['linux/amd64'],
      SHA,
      'release',
      '4.0.0',
      true,
      [`${REPO}:latest`, `${REPO}:4.0.0`],
    ],

  ])('returns expected tags', (preset, platforms, sha, buildContext, buildContextRef, forceLatest, expectedTags) => {
    const tags = dockerUtils.getDockerTags({
      preset, platforms, sha, buildContext, buildContextRef, latestRelease: NEW_REL, forceLatest,
    });
    expect(tags).toEqual(expect.arrayContaining(expectedTags));
  });
});

describe('getDockerCommand', () => {
  test.each([
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      '',
      [`-t ${REPO}:master `],
    ],
    [
      'dev',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      '',
      [`-t ${REPO}:master-dev `],
    ],
    [
      'dev',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      '--cpus 1',
      ['--cpus 1'],
    ],
    // multi-platform
    [
      'lean',
      ['linux/arm64', 'linux/amd64'],
      SHA,
      'push',
      'master',
      '',
      ['--platform linux/arm64,linux/amd64'],
    ],
  ])('returns expected docker command', async (preset, platform, sha, buildContext, buildContextRef, extraFlags, contains) => {
    const cmd = await dockerUtils.getDockerCommand({
      preset, platform, sha, buildContext, buildContextRef, extraFlags, latestRelease: NEW_REL,
    });
    contains.forEach((expectedSubstring) => {
      expect(cmd).toContain(expectedSubstring);
    });
  });
});

describe('getBakeFile', () => {
  test('defaults to the four presets that actually share the Dockerfile', async () => {
    const bakeFile = await dockerUtils.getBakeFile({
      platform: ['linux/amd64'], buildContext: 'push', buildContextRef: 'master', latestRelease: NEW_REL,
    });
    expect(Object.keys(bakeFile.target)).toEqual(['dev', 'lean', 'py311', 'py312']);
    expect(bakeFile.group.default.targets).toEqual(['dev', 'lean', 'py311', 'py312']);
  });

  test('py311 and py312 no longer collide with lean: distinct PY_VER, tags, and cache refs', async () => {
    const bakeFile = await dockerUtils.getBakeFile({
      platform: ['linux/amd64'], buildContext: 'push', buildContextRef: 'master', latestRelease: NEW_REL,
    });
    const { lean, py311, py312 } = bakeFile.target;

    expect(lean.args.PY_VER).toBe('3.10-slim-bookworm');
    expect(py311.args.PY_VER).toBe('3.11-slim-bookworm');
    expect(py312.args.PY_VER).toBe('3.12-slim-bookworm');

    // Same build target (both build the "lean" stage)...
    expect(py311.target).toBe('lean');
    expect(py312.target).toBe('lean');
    // ...but distinct tags and cache refs, since they pin a different PY_VER.
    expect(py311.tags).not.toEqual(lean.tags);
    expect(py312.tags).not.toEqual(lean.tags);
    expect(py311['cache-from']).not.toEqual(lean['cache-from']);
    expect(py312['cache-from']).not.toEqual(py311['cache-from']);
  });

  test('every target shares context "." (the shared Dockerfile) by default', async () => {
    const bakeFile = await dockerUtils.getBakeFile({
      platform: ['linux/amd64'], buildContext: 'push', buildContextRef: 'master', latestRelease: NEW_REL,
    });
    Object.values(bakeFile.target).forEach((target) => {
      expect(target.context).toBe('.');
      expect(target.dockerfile).toBeUndefined();
    });
  });

  test('splits the dockerize preset\'s "-f dockerize.Dockerfile ." into context/dockerfile', async () => {
    const bakeFile = await dockerUtils.getBakeFile({
      presets: ['dockerize'], platform: ['linux/amd64'], buildContext: 'push', buildContextRef: 'master', latestRelease: NEW_REL,
    });
    expect(bakeFile.target.dockerize.context).toBe('.');
    expect(bakeFile.target.dockerize.dockerfile).toBe('dockerize.Dockerfile');
  });

  test('websocket preset uses its own directory as context, default Dockerfile name', async () => {
    const bakeFile = await dockerUtils.getBakeFile({
      presets: ['websocket'], platform: ['linux/amd64'], buildContext: 'push', buildContextRef: 'master', latestRelease: NEW_REL,
    });
    expect(bakeFile.target.websocket.context).toBe('superset-websocket');
    expect(bakeFile.target.websocket.dockerfile).toBeUndefined();
  });

  test('omits cache-to (no push credentials) when DOCKERHUB_TOKEN is unset', async () => {
    delete process.env.DOCKERHUB_TOKEN;
    const bakeFile = await dockerUtils.getBakeFile({
      presets: ['lean'], platform: ['linux/amd64'], buildContext: 'push', buildContextRef: 'master', latestRelease: NEW_REL,
    });
    expect(bakeFile.target.lean['cache-to']).toBeUndefined();
    process.env.DOCKERHUB_TOKEN = 'dummy';
  });
});
