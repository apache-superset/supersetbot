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
      'superset',
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
      'superset',
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
      'superset',
      ['linux/arm64'],
      SHA,
      'release',
      OLD_REL,
      false,
      [`${REPO}:22e7c60-arm`, `${REPO}:${SHA}-arm`, `${REPO}:${OLD_REL}-arm`],
    ],
    [
      'superset',
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
      'superset',
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
      'superset',
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
      'superset',
      ['linux/arm64'],
      SHA,
      'push',
      'master',
      false,
      [`${REPO}:22e7c60-arm`, `${REPO}:${SHA}-arm`, `${REPO}:master-arm`],
    ],
    [
      'superset',
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
      'superset',
      ['linux/amd64'],
      SHA,
      'release',
      '4.0.0',
      true,
      [`${REPO}:latest`, `${REPO}:4.0.0`],
    ],

    // lean now gets a `-lean` suffix, like every other non-`superset` preset
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      false,
      [`${REPO}:22e7c60-lean`, `${REPO}:${SHA}-lean`, `${REPO}:master-lean`],
    ],
    [
      'lean',
      ['linux/arm64'],
      SHA,
      'push',
      'master',
      false,
      [`${REPO}:22e7c60-lean-arm`, `${REPO}:${SHA}-lean-arm`, `${REPO}:master-lean-arm`],
    ],
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'release',
      NEW_REL,
      false,
      [`${REPO}:${NEW_REL}-lean`, `${REPO}:latest-lean`],
    ],

    // real release/master builds are multi-platform, published as a single
    // multi-arch manifest under the plain tag (no per-arch suffix at all)
    [
      'superset',
      ['linux/arm64', 'linux/amd64'],
      SHA,
      'push',
      'master',
      false,
      [`${REPO}:22e7c60`, `${REPO}:${SHA}`, `${REPO}:master`],
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
      'superset',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      '',
      ['--target superset', `-t ${REPO}:master `],
    ],
    [
      'lean',
      ['linux/amd64'],
      SHA,
      'push',
      'master',
      '',
      ['--target lean', `-t ${REPO}:master-lean `],
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
