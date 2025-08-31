/*
 * Copyright 2025, Salesforce, Inc.
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
import path from 'node:path';
import input from '@inquirer/input';
import confirm from '@inquirer/confirm';
import select from '@inquirer/select';
import { Messages, type NamedPackageDir } from '@salesforce/core';
import type { CustomField, DeleteConstraint } from '@salesforce/types/metadata';
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

const deleteConstraintPrompt = async (): Promise<DeleteConstraint> =>
  select({
    message: messages.getMessage('lookupDeleteConstraint'),
    default: 'SetNull',
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
