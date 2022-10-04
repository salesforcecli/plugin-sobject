/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
// import { expect } from 'chai';

describe('generate field NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'field-nut',
      },
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('help should not throw', () => {
    const command = 'generate metadata field --help';
    execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;
  });

  describe('flag validation failures', () => {
    it('short label', () => {
      const command = 'generate metadata field --label yo';
      execCmd(command, { ensureExitCode: 1 });
    });
    it('bad object dir', () => {
      const command = `generate metadata field --label longEnough --object ${path.join(
        'force-app',
        'main',
        'default',
        'tabs'
      )}`;
      execCmd(command, { ensureExitCode: 1 });
    });
  });
});
