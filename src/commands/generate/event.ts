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
import { CustomObject } from 'jsforce/api/metadata';
import { apiNamePrompt, descriptionPrompt, directoryPrompt, pluralPrompt } from '../../shared/prompts';
import { convertJsonToXml } from '../../shared/convert';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-schema-generator', 'generate.event', [
  'examples',
  'summary',
  'description',
  'flags.label.summary',
]);

// there are a lot of properties that we don't, and some that jsforce thinks are mandatory that aren't.
type SaveablePlatformEvent = Pick<
  CustomObject,
  'label' | 'deploymentStatus' | 'description' | 'pluralLabel' | 'eventType' | 'publishBehavior'
>;

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

    const responses = {
      ...(await this.prompt<SaveablePlatformEvent & { directory: string; apiName: string }>([
        directoryPrompt(this.project.getPackageDirectories()),
        pluralPrompt(flags.label),
        apiNamePrompt(flags.label),
        descriptionPrompt,
        {
          type: 'list',
          message: 'Should events publish after a transaction completes, or immediately?',
          name: 'publishBehavior',
          choices: ['PublishImmediately', 'PublishAfterCommit'],
        },
      ])),
    };
    const { directory, apiName, ...platformEvent } = responses;

    const result: CustomObjectGenerateResult = {
      object: {
        ...platformEvent,
        deploymentStatus: 'Deployed',
        eventType: 'HighVolume',
        label: flags.label,
      },
    };
    this.styledJSON(result as AnyJson);
    await fs.promises.mkdir(path.join(directory, apiName));
    await fs.promises.writeFile(
      path.join(directory, apiName, `${apiName}.object-meta.xml`),
      convertJsonToXml({ json: result.object, type: 'CustomObject' })
    );
    return result;
  }
}
