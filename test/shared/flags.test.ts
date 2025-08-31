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
import { join, sep, resolve } from 'node:path';

import { expect } from 'chai';
import { Messages, SfError } from '@salesforce/core';
import { labelValidation, isObjectsFolder, isTabsFolder } from '../../src/shared/flags.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'flags');

describe('flag tests', () => {
  describe('label validation', () => {
    it('passes minimum length label', async () => {
      expect(await labelValidation('foo')).to.equal('foo');
    });
    it('throws an error for labels that are too short', async () => {
      const input = 'fo';
      try {
        await labelValidation(input);
        expect.fail('should have thrown an error');
      } catch (e) {
        if (e instanceof SfError) {
          expect(e.message).to.equal(messages.getMessage('error.labelLength', [input]));
        } else {
          expect.fail('did not return an SfError');
        }
      }
    });
  });

  describe('objects folder validation', () => {
    const input = ['foo', 'tabs'];
    const expected = join(process.cwd(), ...input);
    it('relative', async () => {
      expect(await isTabsFolder(join(...input))).to.equal(expected);
    });
    it('trailing space', async () => {
      expect(await isTabsFolder(`${join(...input)} `)).to.equal(expected);
    });
    it('trailing slash', async () => {
      expect(await isTabsFolder(`${join(...input)}${sep}`)).to.equal(expected);
    });
    it('using traversal', async () => {
      const inputTraverse = join('..', '..', ...input);
      expect(await isTabsFolder(inputTraverse)).to.equal(resolve(inputTraverse));
    });
    it('not tabs', async () => {
      const badInput = ['foo', 'objects'];
      try {
        await isTabsFolder(join(...badInput));
        expect.fail('should have thrown an error');
      } catch (e) {
        if (e instanceof SfError) {
          expect(e.message).to.equal(messages.getMessage('error.tabsDirectory', [join(...badInput)]));
        } else {
          expect.fail('did not return an SfError');
        }
      }
    });
  });

  describe('objects folder validation', () => {
    describe('successes', () => {
      it('one child under objects', async () => {
        const input = '/objects/foo';
        expect(await isObjectsFolder(input)).to.equal(input);
      });

      it('more than one layer under objects', async () => {
        const input = '/objects/folder/foo';
        expect(await isObjectsFolder(input)).to.equal(input);
      });

      it('objects folder is several layers down', async () => {
        const input = 'a/b/c/d/objects/folder/foo';
        expect(await isObjectsFolder(input)).to.equal(input);
      });
    });

    describe('failures', () => {
      const shouldFailWithObjectsFolderError = async (input: string) => {
        try {
          await isObjectsFolder(input);
          expect.fail('should have thrown an error');
        } catch (e) {
          if (e instanceof SfError) {
            expect(e.message).to.equal(messages.getMessage('error.objectDirectory', [input]));
          } else {
            expect.fail('did not return an SfError');
          }
        }
      };
      it('path does not contain objects', async () => {
        await shouldFailWithObjectsFolderError(join('foo'));
      });

      it('path ends in objects =>', async () => {
        await shouldFailWithObjectsFolderError(join('foo', 'objects'));
      });

      it('path ends in objects, sep =>', async () => {
        await shouldFailWithObjectsFolderError(`${join('foo', 'objects')}${sep}`);
      });
    });
  });
});
