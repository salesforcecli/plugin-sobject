/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { CustomField } from 'jsforce/api/metadata';
import { convertJsonToXml } from '../../../shared/convert';
import {
  descriptionPrompt,
  apiNamePrompt,
  objectPrompt,
  integerValidation,
  picklistPrompts,
} from '../../../shared/prompts/prompts';
import { relationshipFieldPrompts } from '../../../shared/prompts/relationshipField';
import { isObjectsFolder, labelValidation } from '../../../shared/flags';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'generate.field');

const MAX_LONG_TEXT_LENGTH = 131072;
const MAX_TEXT_LENGTH = 255;

const supportedFieldTypesCustomObject = [
  'AutoNumber',
  'Checkbox',
  'Currency',
  'DateTime',
  'Date',
  'Email',
  'Html',
  'Location',
  'LongTextArea',
  'Lookup',
  'MasterDetail',
  'Number',
  'Phone',
  'Picklist',
  'Text',
  'Time',
  'Url',
] as const;

const supportedFieldTypesPlatformEvent = ['Text', 'Number', 'DateTime', 'Date', 'LongTextArea', 'Checkbox'] as const;

// there are a lot of properties that we don't need, and some that jsforce thinks are mandatory that aren't.
type SaveableCustomField = Pick<
  CustomField,
  | 'label'
  | 'description'
  | 'trackHistory'
  | 'inlineHelpText'
  | 'required'
  | 'fullName'
  | 'type'
  | 'scale'
  | 'precision'
  | 'visibleLines'
  | 'length'
> & {
  // TODO: get displayLocationInDecimal into jsforce2 typings
  displayLocationInDecimal?: boolean;
  type: (typeof supportedFieldTypesCustomObject)[number];
};

export type FieldGenerateResult = {
  field: SaveableCustomField;
  path: string;
};

// the parts of the field you might prompt for, plus additional questions not on the field
type Response = SaveableCustomField & { object: string };

export default class FieldGenerate extends SfCommand<FieldGenerateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static enableJsonFlag = false;
  public static readonly aliases = ['generate:metadata:field'];
  public static readonly deprecateAliases = true;

  public static readonly flags = {
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
      required: true,
      parse: async (label) => labelValidation(label),
    }),
    // this a dir and not an API name to support 1 object being in multiple package directories
    object: Flags.directory({
      char: 'o',
      exists: true,
      summary: messages.getMessage('flags.object.summary'),
      description: messages.getMessage('flags.object.description'),
      parse: async (input) => isObjectsFolder(input),
    }),
  };

  public async run(): Promise<FieldGenerateResult> {
    const { flags } = await this.parse(FieldGenerate);
    const responses = await this.prompt<Response>(
      [
        await objectPrompt(this.project.getPackageDirectories()),
        apiNamePrompt(flags.label, 'CustomField'),
        {
          type: 'list',
          message: messages.getMessage('prompts.type'),
          name: 'type',
          choices: (answers: { object: string }) => getSupportedFieldTypes(answers.object),
        },
        // AutoNumber
        {
          type: 'number',
          message: messages.getMessage('prompts.startingNumber'),

          validate: (n: number) => integerValidation(n, 0, Number.MAX_SAFE_INTEGER),
          name: 'startingNumber',
          when: (answers: Response) => answers.type === 'AutoNumber',
          default: 0,
        },
        // checkbox type requires a default value
        {
          type: 'list',
          message: messages.getMessage('prompts.defaultValue'),
          choices: [
            { value: false, name: 'false' },
            { value: true, name: 'true' },
          ],
          name: 'defaultValue',
          when: (answers: Response) => answers.type === 'Checkbox',
          default: false,
        },
        // text types
        {
          type: 'number',
          message: `Length (max ${MAX_LONG_TEXT_LENGTH})`,
          validate: (n: number) => integerValidation(n, 1, MAX_LONG_TEXT_LENGTH),
          name: 'length',
          when: (answers: Response) => ['Html', 'LongTextArea'].includes(answers.type),
          default: MAX_LONG_TEXT_LENGTH,
        },
        {
          type: 'number',
          message: `Length (max ${MAX_TEXT_LENGTH})`,
          validate: (n: number) => integerValidation(n, 1, MAX_TEXT_LENGTH),
          name: 'length',
          when: (answers: Response) => answers.type === 'Text',
          default: MAX_TEXT_LENGTH,
        },
        {
          type: 'number',
          message: 'Visible Lines',
          validate: (n: number) => integerValidation(n, 1, 1000),
          name: 'visibleLines',
          when: (answers: Response) => ['Html', 'LongTextArea'].includes(answers.type),
          default: 5,
        },
        // number types
        {
          type: 'number',
          message: messages.getMessage('prompts.scale'),
          validate: (n: number) => integerValidation(n, 0, 18),
          name: 'scale',
          when: (answers: Response) => ['Number', 'Currency', 'Location'].includes(answers.type),
          default: 0,
        },
        {
          type: 'number',
          message: messages.getMessage('prompts.precision'),
          validate: (n: number, answers: Response) => integerValidation(n, 1, 18 - (answers.scale ?? 0)),
          name: 'precision',
          when: (answers: Response) => ['Number', 'Currency'].includes(answers.type),
          default: (answers: Response) => 18 - (answers.scale ?? 0),
        },
        // non-fieldtype-specific questions
        descriptionPrompt,
        {
          type: 'input',
          message: messages.getMessage('prompts.inlineHelpText'),
          name: 'inlineHelpText',
          when: (answers: Response) => !answers.object.includes('__e'),
        },
        {
          type: 'confirm',
          message: messages.getMessage('prompts.required'),
          name: 'required',
          when: (answers: Response) => !['Checkbox', 'MasterDetail', 'Lookup', 'LongTextArea'].includes(answers.type),
          default: false,
        },
        {
          type: 'confirm',
          message: 'Unique',
          name: 'unique',
          when: (answers: Response) => ['Number', 'Text'].includes(answers.type),
          default: false,
        },
        {
          type: 'confirm',
          message: messages.getMessage('prompts.externalId'),
          name: 'externalId',
          when: (answers: Response) => ['Number', 'Text'].includes(answers.type) && answers.object?.endsWith('__e'),
          default: false,
        },
        {
          type: 'list',
          message: messages.getMessage('prompts.securityClassification'),
          name: 'securityClassification',
          choices: ['Public', 'Internal', 'Confidential', 'Restricted', 'Mission Critical'],
          default: 'Internal',
        },
      ],
      // pre-populate the object if they gave us one
      flags.object ? { object: flags.object } : {}
    );

    const { object, ...customField } = responses;

    const result: FieldGenerateResult = {
      field: {
        ...customField,
        label: flags.label,
        // always use decimal version of location unless someone asks us not to in a feature request
        ...(customField.type === 'Location' ? { displayLocationInDecimal: true } : {}),
        // building picklists is an independent inquirer series of questions
        ...(customField.type === 'Picklist' ? { valueSet: await picklistPrompts() } : {}),
        // relationship fields have their own series of questions
        ...(responses.type === 'MasterDetail' || responses.type === 'Lookup'
          ? await relationshipFieldPrompts({
              type: responses.type,
              packageDirs: this.project.getPackageDirectories(),
              childObjectFolderPath: responses.object,
            })
          : {}),
      },
      path: path.join(object, 'fields', `${responses.fullName}.field-meta.xml`),
    };
    this.styledJSON(result as AnyJson);
    await fs.promises.mkdir(path.join(object, 'fields'), { recursive: true });
    await fs.promises.writeFile(result.path, convertJsonToXml({ json: result.field, type: 'CustomField' }));

    this.logSuccess(
      messages.getMessage('success', [path.join(object, 'fields', `${responses.fullName}.field-meta.xml`)])
    );
    return result;
  }
}

/**
 *
 * @param objFolder examples `force-app/main/default/objects/Foo__c` or `force-app/main/default/objects/Foo__e`
 */
const getSupportedFieldTypes = (
  objFolder: string
): typeof supportedFieldTypesCustomObject | typeof supportedFieldTypesPlatformEvent => {
  if (objFolder.endsWith('__b')) {
    throw new Error(messages.getMessage('error.bigObjects'));
  }
  if (objFolder.endsWith('__mdt')) {
    throw new Error(messages.getMessage('error.cmdt'));
  }
  if (objFolder.includes('__e')) {
    return supportedFieldTypesPlatformEvent;
  }
  return supportedFieldTypesCustomObject;
};
