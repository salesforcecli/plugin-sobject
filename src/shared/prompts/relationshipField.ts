/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import path from 'node:path';
import input from '@inquirer/input';
import confirm from '@inquirer/confirm';
import select from '@inquirer/select';
import type { CustomField } from '@jsforce/jsforce-node/lib/api/metadata.js';
import { Messages, type NamedPackageDir } from '@salesforce/core';
import { getObjectXmlByFolderAsJson } from '../fs.js';
import { objectPrompt } from './object.js';
import { makeNameApiCompatible } from './functions.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.relationship');

type RelationshipFieldProperties = Pick<
  CustomField,
  | 'referenceTo'
  | 'relationshipLabel'
  | 'relationshipName'
  | 'deleteConstraint'
  | 'reparentableMasterDetail'
  | 'writeRequiresMasterRead'
  | 'relationshipOrder'
>;

export const relationshipFieldPrompts = async ({
  type,
  packageDirs,
  childObjectFolderPath,
}: {
  type: 'MasterDetail' | 'Lookup';
  packageDirs: NamedPackageDir[];
  childObjectFolderPath: string;
}): Promise<RelationshipFieldProperties> => {
  const childObjectXml = await getObjectXmlByFolderAsJson(childObjectFolderPath);
  const relationshipLabel = await input({
    message: 'Relationship label',
    ...(childObjectXml.pluralLabel ? { default: childObjectXml.pluralLabel } : {}),
  });
  const relationshipName = await input({
    message: 'Relationship name',
    default: makeNameApiCompatible(relationshipLabel),
  });
  return {
    referenceTo: (await objectPrompt(packageDirs, messages.getMessage('objectPrompt'))).split(path.sep).pop(),
    relationshipLabel,
    relationshipName,
    ...(type === 'Lookup' ? { deleteConstraint: await deleteConstraintPrompt() } : {}),
    ...(type === 'MasterDetail' ? await masterDetailPrompts() : {}),
  };
};

const masterDetailPrompts = async (): Promise<
  Pick<RelationshipFieldProperties, 'reparentableMasterDetail' | 'writeRequiresMasterRead'>
> => ({
  reparentableMasterDetail: await confirm({
    message: messages.getMessage('reparentableMasterDetail'),
    default: false,
  }),
  writeRequiresMasterRead: await confirm({
    message: messages.getMessage('writeRequiresMasterRead'),
    default: false,
  }),
});

const deleteConstraintPrompt = async (): Promise<string> =>
  select({
    message: messages.getMessage('lookupDeleteConstraint'),
    default: 'setNull',
    choices: [
      {
        value: 'SetNull',
        name: messages.getMessage('lookupDeleteConstraint.setNull'),
      },
      {
        value: 'Restrict',
        name: messages.getMessage('lookupDeleteConstraint.restrict'),
      },
      {
        value: 'Cascade',
        name: messages.getMessage('lookupDeleteConstraint.cascade'),
      },
    ],
  });
