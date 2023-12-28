/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */



import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import type { AnyJson } from '@salesforce/ts-types';
import { apiNamePrompt, descriptionPrompt, directoryPrompt, pluralPrompt } from '../../../shared/prompts/prompts.js';
import { writeObjectFile } from '../../../shared/fs.js';
import { SaveablePlatformEvent } from '../../../shared/types.js';
import { labelValidation } from '../../../shared/flags.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url)
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'generate.event');

export type PlatformEventGenerateResult = {
  object: SaveablePlatformEvent;
  path: string;
};

export default class PlatformEventGenerate extends SfCommand<PlatformEventGenerateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static enableJsonFlag = false;
  public static readonly aliases = ['generate:metadata:platformevent'];
  public static readonly deprecateAliases = true;
  public static readonly flags = {
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
      required: true,
      parse: async (label) => labelValidation(label),
    }),
  };

  public async run(): Promise<PlatformEventGenerateResult> {
    const { flags } = await this.parse(PlatformEventGenerate);

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
