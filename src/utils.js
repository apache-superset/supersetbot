/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { spawn } from 'child_process';

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadPackageJson() {
  try {
    const packageJsonPath = path.join(dirname, '../package.json');
    const data = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);
    return packageJson;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return null;
  }
}
export async function currentPackageVersion() {
  const data = await loadPackageJson();
  return data.version;
}

export function runShellCommand({
  command, raiseOnError = true, exitOnError = true, cwd = null, dryRun = false,
}) {
  return new Promise((resolve, reject) => {
    const args = command.split(/\s+/).filter((s) => !!s && s !== '\\');
    const spawnOptions = {
      shell: true,
      cwd,
      env: { ...process.env },
    };

    if (cwd) {
      console.log(`RUN \`${command}\` in "${cwd}"`);
    } else {
      console.log(`RUN: \`${command}\``);
    }

    if (dryRun) {
      resolve({ stdout: '', stderr: '' });
      return;
    }
    const child = spawn(args.shift(), args, spawnOptions);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      console.log(data.toString());
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.log(data.toString());
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        const msg = `Command failed with exit code ${code}: ${stderr}`;
        console.error(msg);

        if (raiseOnError) {
          reject(new Error(msg));
        }
        if (exitOnError) {
          process.exit(1);
        }
      }

      resolve({ stdout, stderr });
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

export function shuffleArray(originalArray) {
  const array = [...originalArray]; // Create a shallow copy of the array
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function parsePinnedRequirementsTree(requirements) {
  /* Parse the requirements file and return a tree of dependencies
   * {
   *   'lib1':{
   *      version: '1.0.0',
   *      deps: ['dep1', 'dep2'],
   *    }
   * }
   */
  const lines = requirements
    .split('\n')
    .filter((line) => !line.startsWith('#')) // this removes comments at the top/bottom but not vias since they are indented
    .map((line) => line.trim().toLowerCase())
    .filter((line) => !line.startsWith('# via -r ')) // this removes funky lines refing other files
    .filter((line) => !line.startsWith('-e ')) // this removes funky lines refing other files
    .filter((line) => !!line); // this removes empty lines

  const depsObject = {};
  let currentDep = null;

  lines.forEach((line) => {
    const depMatch = line.match(/^(.+)==(.*)/);
    if (depMatch) {
      currentDep = depMatch[1].trim();
      const version = depMatch[2].trim();
      if (currentDep && depsObject[currentDep] === undefined) {
        depsObject[currentDep] = {
          version, vias: [], deps: [],
        };
      } else if (version) {
        depsObject[currentDep].version = version;
      }
    } else {
      const viaLib = line.replace('# via', '').trim().replace('#', '').trim();
      if (viaLib && currentDep) {
        if (depsObject[viaLib] === undefined) {
          depsObject[viaLib] = {
            deps: [], version: null, vias: [],
          };
        }
        depsObject[viaLib].deps.push(currentDep);

        if (depsObject[currentDep] === undefined) {
          depsObject[currentDep] = { deps: [], version: null, vias: [] };
        }
        depsObject[currentDep].vias.push(viaLib);
      }
    }
  });
  return depsObject;
}

export function mergeParsedRequirementsTree(obj1, obj2) {
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  const merged = {};

  keys.forEach((key) => {
    merged[key] = {
      deps: [...new Set([...(obj1[key]?.deps || []), ...(obj2[key]?.deps || [])])],
      vias: [...new Set([...(obj1[key]?.vias || []), ...(obj2[key]?.vias || [])])],
      version: obj1[key]?.version || obj2[key]?.version,
    };
  });
  return merged;
}

export function compareSemVer(a, b) {
  const splitA = a.split('.').map(Number);
  const splitB = b.split('.').map(Number);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 3; i++) {
    if (splitA[i] > splitB[i]) return 1;
    if (splitA[i] < splitB[i]) return -1;
  }

  return 0; // Versions are equal
}
