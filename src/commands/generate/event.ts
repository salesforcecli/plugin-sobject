/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { apiNamePrompt, descriptionPrompt, directoryPrompt, pluralPrompt } from '../../shared/prompts/prompts';
import { writeObjectFile } from '../../shared/fs';
import { SaveablePlatformEvent } from '../../shared/types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-schema-generator', 'generate.event', [
  'examples',
  'summary',
  'description',
  'flags.label.summary',
]);

export type CustomObjectGenerateResult = {
  object: SaveablePlatformEvent;
};

export default class ObjectGenerate extends SfCommand<CustomObjectGenerateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;

  public static flags = {
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
      required: true,
    }),
  };

  public async run(): Promise<CustomObjectGenerateResult> {
    const { flags } = await this.parse(ObjectGenerate);

    const responses = await this.prompt<SaveablePlatformEvent & { directory: string }>([
      await directoryPrompt(this.project.getPackageDirectories()),
      pluralPrompt(flags.label),
      apiNamePrompt(flags.label, 'PlatformEvent'),
      descriptionPrompt,
      {
        type: 'list',
        message: 'Should events publish after a transaction completes, or immediately?',
        name: 'publishBehavior',
        choices: ['PublishImmediately', 'PublishAfterCommit'],
      },
    ]);
    const { directory, ...platformEvent } = responses;

    const result: CustomObjectGenerateResult = {
      object: {
        ...platformEvent,
        deploymentStatus: 'Deployed',
        eventType: 'HighVolume',
        label: flags.label,
      },
    };
    this.styledJSON(result as AnyJson);
    await writeObjectFile(directory, result.object);
    return result;
  }
}
