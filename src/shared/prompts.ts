/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { NamedPackageDir } from '@salesforce/core';
import { Question } from 'inquirer';
import { getObjectDirectories } from './fs';

export const directoryPrompt = async (packageDirs: NamedPackageDir[]): Question => ({
  type: 'list',
  message: 'Where should this new object be created?',
  name: 'directory',
  choices: await getObjectDirectories(packageDirs.map((pd) => pd.path)),
});

export const pluralPrompt = (label: string): Question => ({
  type: 'input',
  message: 'Plural Label',
  name: 'pluralLabel',
  default: `${label}s`,
});

export const apiNamePrompt = (label: string): Question => ({
  type: 'input',
  message: 'API Name',
  name: 'apiName',
  default: `${label.replace(' ', '_')}__c`,
});

export const descriptionPrompt = {
  type: 'input',
  message: 'Description (be a winner and write a description of your object)',
  name: 'description',
  default: 'I am a loser',
};
