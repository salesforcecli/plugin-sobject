/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { CustomObject, CustomField } from 'jsforce/api/metadata';
import { convertJsonToXml } from '../../shared/convert';
import { descriptionPrompt, directoryPrompt, pluralPrompt, apiNamePrompt } from '../../shared/prompts';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-schema-generator', 'generate.object', [
  'examples',
  'summary',
  'description',
  'flags.label.summary',
  'flags.use-default-features.summary',
  'flags.use-default-features.description',
]);

// there are a lot of properties that we don't, and some that jsforce thinks are mandatory that aren't.
type SaveableCustomObject = Pick<
  CustomObject,
  | 'label'
  | 'deploymentStatus'
  | 'description'
  | 'enableHistory'
  | 'enableActivities'
  | 'enableBulkApi'
  | 'enableFeeds'
  | 'enableReports'
  | 'enableSearch'
  | 'enableStreamingApi'
  | 'enableSharing'
  | 'pluralLabel'
  | 'sharingModel'
  | 'fullName'
> & { nameField: Pick<CustomField, 'label' | 'type' | 'displayFormat'> };

export type CustomObjectGenerateResult = {
  object: SaveableCustomObject;
};

const defaultFeatures: Partial<SaveableCustomObject> = {
  enableHistory: true,
  enableActivities: true,
  enableSearch: true,
  enableFeeds: true,
  enableReports: true,
  enableBulkApi: true,
  enableSharing: true,
  enableStreamingApi: true,
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
    'use-default-features': Flags.boolean({
      char: 'f',
      summary: messages.getMessage('flags.use-default-features.summary'),
      description: messages.getMessage('flags.use-default-features.description'),
    }),
  };

  public async run(): Promise<CustomObjectGenerateResult> {
    const { flags } = await this.parse(ObjectGenerate);

    const responses = await this.prompt<
      SaveableCustomObject & {
        nameFieldType: 'Text' | 'AutoNumber';
        nameFieldLabel: 'string';
        autoNumberFormat?: string;
        directory: string;
      }
    >(
      [
        await directoryPrompt(this.project.getPackageDirectories()),
        pluralPrompt(flags.label),
        apiNamePrompt(flags.label),
        descriptionPrompt,
        {
          type: 'input',
          message: 'What should the Name field be called',
          name: 'nameFieldLabel',
          default: `${flags.label} Name`,
        },
        {
          type: 'list',
          message: 'Is the name field autonumber or text?',
          name: 'nameFieldType',
          default: 'Text',
          choices: ['Text', 'AutoNumber'],
        },
        {
          type: 'input',
          when: (answers: { nameFieldType: 'AutoNumber' | 'Text' }) => answers.nameFieldType === 'AutoNumber',
          message: 'AutoNumber Format',
          name: 'autoNumberFormat',
          default: `${flags.label}-{0}`,
        },
        {
          type: 'confirm',
          message: 'Enable search',
          name: 'enableSearch',
          when: !flags['use-default-features'],
        },
        {
          type: 'confirm',
          message: 'Enable feeds',
          name: 'enableFeeds',
          when: !flags['use-default-features'],
        },
        {
          type: 'confirm',
          message: 'Enable reports',
          name: 'enableReports',
          when: !flags['use-default-features'],
        },
        {
          type: 'confirm',
          message: 'Enable history',
          name: 'enableHistory',
          when: !flags['use-default-features'],
        },
        {
          type: 'confirm',
          message: 'Enable activities',
          name: 'enableActivities',
          when: !flags['use-default-features'],
        },
        {
          type: 'confirm',
          message: 'Enable bulk API',
          name: 'enableBulkApi',
          when: !flags['use-default-features'],
        },
        {
          type: 'confirm',
          message: 'Enable streaming API',
          name: 'enableStreamingApi',
          when: !flags['use-default-features'],
        },
        {
          type: 'confirm',
          message: 'Enable sharing',
          name: 'enableSharing',
          when: !flags['use-default-features'],
        },
        {
          type: 'list',
          choices: ['ReadWrite', 'Read', 'Private'],
          message: 'Org wide sharing model',
          name: 'sharingModel',
          when: (answers: { enableSharing: boolean }) => answers.enableSharing || flags['use-default-features'],
        },
      ],
      flags['use-default-features'] ? defaultFeatures : {}
    );

    const { nameFieldType, nameFieldLabel, autoNumberFormat, directory, ...customObject } = responses;

    const result: CustomObjectGenerateResult = {
      object: {
        ...customObject,
        nameField: {
          ...{
            type: nameFieldType,
            label: nameFieldLabel,
          },
          ...(responses.nameFieldType === 'AutoNumber' ? { displayFormat: autoNumberFormat } : {}),
        },
        deploymentStatus: 'Deployed',
        label: flags.label,
      },
    };
    this.styledJSON(result as AnyJson);
    await fs.promises.mkdir(path.join(directory, responses.fullName));
    await fs.promises.writeFile(
      path.join(directory, responses.fullName, `${responses.fullName}.object-meta.xml`),
      convertJsonToXml({ json: result.object, type: 'CustomObject' })
    );

    return result;
  }
}
