/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'node:path';
import fs from 'node:fs';
import { TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import {
  getDirectoriesThatContainObjects,
  getObjectDirectories,
  getObjectXmlByFolderAsJson,
  writeObjectFile,
} from '../../src/shared/fs.js';
import { SaveableCustomObject } from '../../src/shared/types.js';

describe('local fs NUTs', () => {
  let session: TestSession;
  let pkgDirs: string[];

  const forceAppObjectsPath = path.join('force-app', 'main', 'default', 'objects');

  before(async () => {
    session = await TestSession.create({
      project: {
        gitClone: 'https://github.com/salesforcecli/sample-project-multiple-packages',
      },
    });
    pkgDirs = ['force-app', 'my-app'].map((dir) => path.join(session.project.dir, dir));
  });

  after(async () => {
    await session?.clean();
  });

  it('getDirectoriesThatContainObjects', async () => {
    const result = await getDirectoriesThatContainObjects(pkgDirs);

    expect(result).to.deep.equal(
      [forceAppObjectsPath, path.join('my-app', 'objects')].map((dir) => path.join(session.project.dir, dir))
    );
  });

  it('getObjectDirectories', async () => {
    const result = await getObjectDirectories(pkgDirs);

    expect(result).to.deep.equal(
      [
        ...['Account', 'MyObj__c'].map((obj) => path.join(forceAppObjectsPath, obj)),
        ...['Case', 'MyObj__c'].map((obj) => path.join('my-app', 'objects', obj)),
      ].map((dir) => path.join(session.project.dir, dir))
    );
  });

  it('getObjectXmlByNameAsJson', async () => {
    const result = await getObjectXmlByFolderAsJson(path.join(session.project.dir, forceAppObjectsPath, 'MyObj__c'));
    expect(result.label).to.equal('MyObj');
    expect(result.pluralLabel).to.equal('MyObj');
  });

  it('writeObjectFile', async () => {
    const obj = {
      fullName: 'Nut__c',
      label: 'Nut',
      nameField: {
        label: 'Nut',
        type: 'Text',
      },
    } satisfies SaveableCustomObject;

    const expectedPath = path.join(
      session.project.dir,
      forceAppObjectsPath,
      obj.fullName,
      `${obj.fullName}.object-meta.xml`
    );
    const result = await writeObjectFile(path.join(session.project.dir, forceAppObjectsPath), obj);
    expect(result).to.equal(expectedPath);
    // file got written
    expect(fs.existsSync(expectedPath)).to.be.true;

    // xml seems correct
    const fileContents = await fs.promises.readFile(expectedPath, 'utf8');
    expect(fileContents).to.include('<label>Nut</label>');
  });
});
