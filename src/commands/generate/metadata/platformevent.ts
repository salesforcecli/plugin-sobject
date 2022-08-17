/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { apiNamePrompt, descriptionPrompt, directoryPrompt, pluralPrompt } from '../../../shared/prompts/prompts';
import { writeObjectFile } from '../../../shared/fs';
import { SaveablePlatformEvent } from '../../../shared/types';
import { labelValidation } from '../../../shared/flags';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-sobject', 'generate.event', [
  'examples',
  'summary',
  'description',
  'flags.label.summary',
  'prompts.publishBehavior',
]);

export type PlatformEventGenerateResult = {
  object: SaveablePlatformEvent;
  path: string;
};

export default class ObjectGenerate extends SfCommand<PlatformEventGenerateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static enableJsonFlag = false;
  public static state = 'beta';

  public static flags = {
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
      required: true,
      parse: async (label) => labelValidation(label),
    }),
  };

  public async run(): Promise<PlatformEventGenerateResult> {
    const { flags } = await this.parse(ObjectGenerate);

    const responses = await this.prompt<SaveablePlatformEvent & { directory: string }>([
      await directoryPrompt(this.project.getPackageDirectories()),
      pluralPrompt(flags.label),
      apiNamePrompt(flags.label, 'PlatformEvent'),
      descriptionPrompt,
      {
        type: 'list',
        message: messages.getMessage('prompts.publishBehavior'),
        name: 'publishBehavior',
        choices: ['PublishImmediately', 'PublishAfterCommit'],
      },
    ]);
    const { directory, ...platformEvent } = responses;

    const objectToWrite: PlatformEventGenerateResult['object'] = {
      ...platformEvent,
      deploymentStatus: 'Deployed',
      eventType: 'HighVolume',
      label: flags.label,
    };

    this.styledJSON(objectToWrite as AnyJson);
    const writePath = await writeObjectFile(directory, objectToWrite);
    return { object: objectToWrite, path: writePath };
  }
}
