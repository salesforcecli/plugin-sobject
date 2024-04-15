/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'node:fs';
import path from 'node:path';
import input from '@inquirer/input';
import select from '@inquirer/select';
import confirm from '@inquirer/confirm';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import type { AnyJson } from '@salesforce/ts-types';
import type { CustomField } from '@jsforce/jsforce-node/lib/api/metadata.js';
import { convertJsonToXml } from '../../../shared/convert.js';
import { picklistPrompts } from '../../../shared/prompts/picklist.js';
import { integerValidation } from '../../../shared/prompts/functions.js';
import { apiNamePrompt } from '../../../shared/prompts/apiName.js';
import { descriptionPrompt } from '../../../shared/prompts/description.js';
import { objectPrompt } from '../../../shared/prompts/object.js';
import { relationshipFieldPrompts } from '../../../shared/prompts/relationshipField.js';
import { isObjectsFolder, labelValidation } from '../../../shared/flags.js';
import { toSelectOption } from '../../../shared/prompts/functions.js';
import { lengthPrompt } from '../../../shared/prompts/fields/text.js';
import { visibleLinePrompt } from '../../../shared/prompts/fields/text.js';
import { precisionPrompt } from '../../../shared/prompts/fields/number.js';
import { scalePrompt } from '../../../shared/prompts/fields/number.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
export const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'generate.field');

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
  | 'unique'
  | 'externalId'
  | 'startingNumber'
  | 'defaultValue'
  | 'securityClassification'
> & {
  // TODO: get displayLocationInDecimal into jsforce2 typings
  displayLocationInDecimal?: boolean;
  type: (typeof supportedFieldTypesCustomObject)[number];
};

export type FieldGenerateResult = {
  field: SaveableCustomField;
  path: string;
};

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
      parse: labelValidation,
    }),
    // this a dir and not an API name to support 1 object being in multiple package directories
    object: Flags.directory({
      char: 'o',
      exists: true,
      summary: messages.getMessage('flags.object.summary'),
      description: messages.getMessage('flags.object.description'),
      parse: isObjectsFolder,
    }),
  };

  public async run(): Promise<FieldGenerateResult> {
    const { flags } = await this.parse(FieldGenerate);
    const object = flags.object ?? (await objectPrompt(this.project!.getPackageDirectories()));
    const fullName = await apiNamePrompt(flags.label, 'CustomField');
    const type = (await select({
      message: messages.getMessage('prompts.type'),
      choices: getSupportedFieldTypes(object).map(toSelectOption),
      // select accepts a type param, but either TS or inquirer isn't happy with the typing of it
    })) as (typeof supportedFieldTypesCustomObject)[number];

    const startingNumber = await startingNumberPrompt(type);
    const defaultValue = await defaultValuePrompt(type);
    const length = await lengthPrompt(type);

    const visibleLines = await visibleLinePrompt(type);
    // number types
    const scale = await scalePrompt(type);
    const precision = await precisionPrompt(type, scale);

    // non-fieldtype-specific questions
    const description = await descriptionPrompt();
    const inlineHelpText = await inlineHelpPrompt(object);
    const required = await requiredPrompt(type);
    const unique = await uniquePrompt(type);
    const externalId = await externalIdPrompt(type, object);

    const result: FieldGenerateResult = {
      field: {
        fullName,
        type,
        ...(precision !== undefined ? { precision } : {}),
        ...(scale !== undefined ? { scale } : {}),
        ...(visibleLines !== undefined ? { visibleLines } : {}),
        ...(length !== undefined ? { length } : {}),
        ...(inlineHelpText !== undefined ? { inlineHelpText } : {}),
        ...(required !== undefined ? { required } : {}),
        ...(unique !== undefined ? { unique } : {}),
        ...(externalId !== undefined ? { externalId } : {}),
        ...(startingNumber !== undefined ? { startingNumber } : {}),
        ...(defaultValue !== undefined ? { defaultValue } : {}),
        description,
        label: flags.label,
        // always use decimal version of location unless someone asks us not to in a feature request
        ...(type === 'Location' ? { displayLocationInDecimal: true } : {}),
        // building picklists is an independent inquirer series of questions
        ...(type === 'Picklist' ? { valueSet: await picklistPrompts() } : {}),
        // relationship fields have their own series of questions
        ...(type === 'MasterDetail' || type === 'Lookup'
          ? await relationshipFieldPrompts({
              type,
              packageDirs: this.project!.getPackageDirectories(),
              childObjectFolderPath: object,
            })
          : {}),
        securityClassification: await securityPrompt(),
      },
      path: path.join(object, 'fields', `${fullName}.field-meta.xml`),
    };
    this.styledJSON(result as AnyJson);
    await fs.promises.mkdir(path.join(object, 'fields'), { recursive: true });
    await fs.promises.writeFile(result.path, convertJsonToXml({ json: result.field, type: 'CustomField' }));

    this.logSuccess(messages.getMessage('success', [path.join(object, 'fields', `${fullName}.field-meta.xml`)]));
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

// checkbox type requires a default value
const defaultValuePrompt = async (type: string): Promise<string | undefined> =>
  type === 'Checkbox'
    ? select({
        message: messages.getMessage('prompts.defaultValue'),
        choices: [{ value: 'false' }, { value: 'true' }],
        default: 'false',
      })
    : undefined;

const startingNumberPrompt = async (type: string): Promise<number | undefined> =>
  type === 'AutoNumber'
    ? Number(
        await input({
          message: messages.getMessage('prompts.startingNumber'),
          default: '0',
          validate: integerValidation({ min: 0, max: Number.MAX_SAFE_INTEGER }),
        })
      )
    : undefined;

const securityPrompt = async (): Promise<string> =>
  select({
    message: messages.getMessage('prompts.securityClassification'),
    choices: ['Public', 'Internal', 'Confidential', 'Restricted', 'Mission Critical'].map(toSelectOption),
    default: 'Internal',
  });

const externalIdPrompt = async (type: string, object: string): Promise<boolean | undefined> =>
  (type === 'Number' || type === 'Text') && !object.endsWith('__e')
    ? confirm({
        message: messages.getMessage('prompts.externalId'),
        default: false,
      })
    : undefined;

const uniquePrompt = async (type: string): Promise<boolean | undefined> =>
  type === 'Number' || type === 'Text'
    ? confirm({
        message: 'Unique',
        default: false,
      })
    : undefined;

const requiredPrompt = async (type: string): Promise<boolean | undefined> =>
  ['Checkbox', 'MasterDetail', 'Lookup', 'LongTextArea'].includes(type)
    ? undefined
    : confirm({
        message: messages.getMessage('prompts.required'),
        default: false,
      });

const inlineHelpPrompt = async (object: string): Promise<string | undefined> =>
  object.includes('__e')
    ? undefined
    : input({
        message: messages.getMessage('prompts.inlineHelpText'),
      });
