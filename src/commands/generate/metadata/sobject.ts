/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname } from 'path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { sentenceCase } from 'change-case';
import {
  descriptionPrompt,
  directoryPrompt,
  pluralPrompt,
  apiNamePrompt,
  namePrompts,
} from '../../../shared/prompts/prompts';
import { writeObjectFile } from '../../../shared/fs';
import { SaveableCustomObject, NameFieldResponse } from '../../../shared/types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-schema-sf', 'generate.object', [
  'examples',
  'summary',
  'description',
  'flags.label.summary',
  'flags.use-default-features.summary',
  'flags.use-default-features.description',
  'prompts.sharingModel',
  'success',
  'success.advice',
  'success.field',
]);

export type CustomObjectGenerateResult = {
  object: SaveableCustomObject;
  path: string;
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
  public static enableJsonFlag = false;

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

    const responses = await this.prompt<SaveableCustomObject & NameFieldResponse & { directory: string }>(
      [
        await directoryPrompt(this.project.getPackageDirectories()),
        pluralPrompt(flags.label),
        apiNamePrompt(flags.label, 'CustomObject'),
        descriptionPrompt,
        ...namePrompts(flags.label),
        // transform the default features into confirm prompts
        ...Object.keys(defaultFeatures).map((name) => ({
          type: 'confirm',
          name,
          message: sentenceCase(name).replace('Api', 'API'),
        })),
        {
          type: 'list',
          choices: ['ReadWrite', 'Read', 'Private'],
          message: messages.getMessage('prompts.sharingModel'),
          name: 'sharingModel',
          when: (answers: SaveableCustomObject & NameFieldResponse & { directory: string }) =>
            answers.enableSharing || flags['use-default-features'],
        },
      ],
      flags['use-default-features'] ? defaultFeatures : {}
    );

    const { nameFieldType, nameFieldLabel, autoNumberFormat, directory, ...customObject } = responses;

    const resultsObject = {
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
    };

    this.styledJSON(resultsObject as AnyJson);
    const writePath = await writeObjectFile(directory, resultsObject);
    this.logSuccess(messages.getMessage('success', [writePath]));
    this.info(messages.getMessage('success.field', [dirname(writePath)]));
    this.info(messages.getMessage('success.advice'));
    this.info(messages.getMessage('success.advice'));
    return { object: resultsObject, path: writePath };
  }
}