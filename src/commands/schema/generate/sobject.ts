/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname } from 'node:path';
import select from '@inquirer/select';
import confirm from '@inquirer/confirm';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { nameFieldPrompts } from '../../../shared/prompts/nameField.js';
import { apiNamePrompt } from '../../../shared/prompts/apiName.js';
import { pluralPrompt } from '../../../shared/prompts/plural.js';
import { directoryPrompt } from '../../../shared/prompts/directory.js';
import { descriptionPrompt } from '../../../shared/prompts/description.js';
import { writeObjectFile } from '../../../shared/fs.js';
import { SaveableCustomObject } from '../../../shared/types.js';
import { labelValidation } from '../../../shared/flags.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'generate.object');

export type CustomObjectGenerateResult = {
  object: SaveableCustomObject;
  path: string;
};

type DefaultFeatures = Pick<
  SaveableCustomObject,
  | 'enableHistory'
  | 'enableActivities'
  | 'enableSearch'
  | 'enableFeeds'
  | 'enableReports'
  | 'enableSharing'
  | 'enableBulkApi'
  | 'enableStreamingApi'
>;

const defaultFeatures: DefaultFeatures = {
  enableHistory: true,
  enableActivities: true,
  enableSearch: true,
  enableFeeds: true,
  enableReports: true,
  enableBulkApi: true,
  enableSharing: true,
  enableStreamingApi: true,
} as const;

export default class ObjectGenerate extends SfCommand<CustomObjectGenerateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static enableJsonFlag = false;
  public static readonly aliases = ['generate:metadata:sobject'];
  public static readonly deprecateAliases = true;
  public static readonly flags = {
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
      required: true,
      parse: async (label) => labelValidation(label),
    }),
    'use-default-features': Flags.boolean({
      char: 'f',
      summary: messages.getMessage('flags.use-default-features.summary'),
      description: messages.getMessage('flags.use-default-features.description'),
    }),
  };

  public async run(): Promise<CustomObjectGenerateResult> {
    const { flags } = await this.parse(ObjectGenerate);

    const directory = await directoryPrompt(this.project!.getPackageDirectories());

    const resultsObject = {
      pluralLabel: await pluralPrompt(flags.label),
      fullName: await apiNamePrompt(flags.label, 'CustomObject'),
      description: await descriptionPrompt(),
      nameField: await nameFieldPrompts(flags.label),
      ...(flags['use-default-features'] ? defaultFeatures : await promptForDefaultFeatures()),
      sharingModel: await select({
        message: messages.getMessage('prompts.sharingModel'),
        choices: [{ value: 'ReadWrite' }, { value: 'Read' }, { value: 'Private' }],
      }),
      label: flags.label,
      deploymentStatus: 'Deployed',
    } satisfies SaveableCustomObject;

    this.styledJSON(resultsObject);
    const writePath = await writeObjectFile(directory, resultsObject);
    this.logSuccess(messages.getMessage('success', [writePath]));
    this.info(messages.getMessage('success.field', [dirname(writePath)]));
    this.log();
    this.info(messages.getMessage('success.advice'));
    return { object: resultsObject, path: writePath };
  }
}

const promptForDefaultFeatures = async (): Promise<DefaultFeatures> => {
  const enterprise = await confirm({
    message: 'Enable Enterprise Features (Sharing, Bulk API, and Streaming API)',
    default: true,
  });
  return {
    enableBulkApi: enterprise,
    enableSharing: enterprise,
    enableStreamingApi: enterprise,
    enableHistory: await confirm({ message: 'Enable History', default: true }),
    enableActivities: await confirm({ message: 'Enable Activities', default: true }),
    enableSearch: await confirm({ message: 'Enable Search', default: true }),
    enableFeeds: await confirm({ message: 'Enable Feeds', default: true }),
    enableReports: await confirm({ message: 'Enable Reports', default: true }),
  };
};
