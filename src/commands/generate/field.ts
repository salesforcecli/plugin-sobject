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
import { CustomField } from 'jsforce/api/metadata';
import { convertJsonToXml } from '../../shared/convert';
import { descriptionPrompt, apiNamePrompt, objectPrompt, integerValidation, buildPicklist } from '../../shared/prompts';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-schema-generator', 'generate.field', [
  'examples',
  'summary',
  'description',
  'flags.label.summary',
  'flags.object.summary',
  'flags.object.description',
]);

const MAX_LONG_TEXT_LENGTH = 131072;
const MAX_TEXT_LENGTH = 255;

const supportedFieldTypesCustomObject = [
  'AutoNumber',
  'Text',
  'Number',
  'DateTime',
  'Date',
  'Time',
  'LongTextArea',
  'Checkbox',
  'Url',
  'Email',
  'Phone',
  'Currency',
  'Picklist',
  'Html',
  'Location',
  'Lookup',
  'MasterDetail',
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
  type: typeof supportedFieldTypesCustomObject[number];
};

export type FieldGenerateResult = {
  field: SaveableCustomField;
};

// the parts of the field you might prompt for, plus additional questions not on the field
type Response = SaveableCustomField & { object: string };

export default class FieldGenerate extends SfCommand<FieldGenerateResult> {
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
    object: Flags.directory({
      char: 'o',
      exists: true,
      summary: messages.getMessage('flags.object.summary'),
      description: messages.getMessage('flags.object.description'),
    }),
  };

  public async run(): Promise<FieldGenerateResult> {
    const { flags } = await this.parse(FieldGenerate);
    // TODO: if an object was provided, verify that it exists locally

    const responses = await this.prompt<Response>(
      [
        await objectPrompt(this.project.getPackageDirectories()),
        apiNamePrompt(flags.label),
        {
          type: 'list',
          message: 'Field type',
          name: 'type',
          choices: (answers: { object: string }) => getSupportedFieldTypes(answers.object),
        },
        // AutoNumber
        {
          type: 'list',
          message: 'Starting Number',
          validate: (n: number) => integerValidation(n, 0, Number.MAX_SAFE_INTEGER),
          name: 'startingNumber',
          when: (answers: Response) => answers.type === 'AutoNumber',
          default: 0,
        },
        // checkbox type requires a default value
        {
          type: 'list',
          message: 'Default checkbox value',
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
          message: 'How many decimal places',
          validate: (n: number) => integerValidation(n, 0, 18),
          name: 'scale',
          when: (answers: Response) => ['Number', 'Currency', 'Location'].includes(answers.type),
          default: 0,
        },
        {
          type: 'number',
          message: 'How many total digits, including those decimal places?',
          validate: (n: number, answers: Response) => integerValidation(n, 1, 18 - answers.scale),
          name: 'precision',
          when: (answers: Response) => ['Number', 'Currency'].includes(answers.type),
          default: (answers: Response) => 18 - answers.scale,
        },
        // non-fieldtype-specific questions
        descriptionPrompt,
        {
          type: 'input',
          message: 'User-facing help text (for those bubbles on the record page)',
          name: 'inlineHelpText',
        },
        {
          type: 'confirm',
          message: 'Required',
          name: 'required',
          when: (answers: Response) => answers.type !== 'Checkbox',
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
          message: 'Use this field as an external ID',
          name: 'externalId',
          when: (answers: Response) => ['Number', 'Text'].includes(answers.type) && answers.object?.endsWith('__e'),
          default: false,
        },
        {
          type: 'choice',
          message: "Security Classification (how sensitive is this field's content",
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
        // always use decimal version of location unless someone asks us not to
        ...(customField.type === 'Location' ? { displayLocationInDecimal: true } : {}),
        // building picklists is an independent inquirer series of questions
        ...(customField.type === 'Picklist' ? { valueSet: await buildPicklist() } : {}),
      },
    };
    this.styledJSON(result as AnyJson);
    await fs.promises.mkdir(path.join(object, 'fields'), { recursive: true });
    await fs.promises.writeFile(
      path.join(object, 'fields', `${responses.fullName}.field-meta.xml`),
      convertJsonToXml({ json: result.field, type: 'CustomField' })
    );

    this.logSuccess(`Created ${path.join(path.join(object, 'fields', `${responses.fullName}.field-meta.xml`))}.`);

    return result;
  }
}

const getSupportedFieldTypes = (
  objPath: string
): typeof supportedFieldTypesCustomObject | typeof supportedFieldTypesPlatformEvent => {
  if (objPath.endsWith('__b')) {
    throw new Error('BigObjects are not suppored by this command');
  }
  if (objPath.endsWith('__mdt')) {
    throw new Error('Custom Metadata Types are not suppored by this command');
  }
  if (objPath.includes('__e')) {
    return supportedFieldTypesPlatformEvent;
  }
  return supportedFieldTypesCustomObject;
};
