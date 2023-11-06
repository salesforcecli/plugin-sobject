/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';

describe('generate platformevent NUTs', () => {
  let session: TestSession;

  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'platformevent-nut',
      },
    });
  });

  after(async () => {
    await session?.clean();
  });

  it('help should not throw', () => {
    const command = 'generate metadata platformevent --help';
    execCmd(command, { ensureExitCode: 0 });
  });

  describe('flag validation failures', () => {
    it('short label', () => {
      const command = 'generate metadata platformevent --label yo';
      execCmd(command, { ensureExitCode: 1 });
    });
  });
});
