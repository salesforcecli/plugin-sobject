/*
 * Copyright 2026, Salesforce, Inc.
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
import { dirname } from 'node:path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core/messages';
import select from '@inquirer/select';
import type { AnyJson } from '@salesforce/ts-types';
import { apiNamePrompt } from '../../../shared/prompts/apiName.js';
import { pluralPrompt } from '../../../shared/prompts/plural.js';
import { directoryPrompt } from '../../../shared/prompts/directory.js';
import { descriptionPrompt } from '../../../shared/prompts/description.js';
import { writeObjectFile } from '../../../shared/fs.js';
import { SaveablePlatformEvent } from '../../../shared/types.js';
import { labelValidation } from '../../../shared/flags.js';
import { toSelectOption } from '../../../shared/prompts/functions.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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
      parse: labelValidation,
    }),
  };

  public async run(): Promise<PlatformEventGenerateResult> {
    const { flags } = await this.parse(PlatformEventGenerate);

    const directory = await directoryPrompt(this.project!.getPackageDirectories());

    const objectToWrite: PlatformEventGenerateResult['object'] = {
      fullName: await apiNamePrompt(flags.label, 'PlatformEvent'),
      pluralLabel: await pluralPrompt(flags.label),
      description: await descriptionPrompt(),
      publishBehavior: await select({
        message: messages.getMessage('prompts.publishBehavior'),
        choices: (['PublishImmediately', 'PublishAfterCommit'] as const).map(toSelectOption),
      }),
      deploymentStatus: 'Deployed',
      eventType: 'HighVolume',
      label: flags.label,
    };

    this.styledJSON(objectToWrite as AnyJson);
    const writePath = await writeObjectFile(directory, objectToWrite);
    this.info(messages.getMessage('success.field', [dirname(writePath)]));

    return { object: objectToWrite, path: writePath };
  }
}
