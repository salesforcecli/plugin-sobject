/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { NamedPackageDir } from '@salesforce/core';
import { prompt, Question, ListQuestion } from 'inquirer';
import { ValueSet, CustomValue } from 'jsforce/api/metadata';
import { getObjectDirectories, getObjectApiNames } from './fs';

export const directoryPrompt = async (packageDirs: NamedPackageDir[]): Promise<ListQuestion> => ({
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
  name: 'fullName',
  default: `${label.replace(/ /g, '_').replace(/-/g, '_')}__c`,
});

export const descriptionPrompt = {
  type: 'input',
  message: 'Description (be a winner and write a description of your object)',
  name: 'description',
  default: 'Only losers leave no field descriptions.',
};

export const objectPrompt = async (packageDirs: NamedPackageDir[]): Promise<ListQuestion> => ({
  type: 'list',
  message: 'What object is this field for',
  name: 'object',
  choices: (await getObjectApiNames(packageDirs.map((pd) => pd.path)))
    .sort()
    .map((objDir) => ({ value: objDir, name: objDir.split('/').pop() })),
});

export const integerValidation = (value: number, min: number, max: number): true | string => {
  if (value < min) return `${value} is too low. Minimum is ${min}`;
  if (value > max) return `${value} is too high. Maximum is ${max}`;
  return true;
};

/**
 * recursively keep adding picklist values until the user says to stop
 */

export const buildPicklist = async (): Promise<Omit<ValueSet, 'valueSettings'>> => {
  const output: CustomValue[] = [];
  let keepAsking = true;

  while (keepAsking) {
    const response = await prompt<{ picklistValue: string }>({
      type: 'input',
      name: 'picklistValue',
      message:
        output.length === 0
          ? 'Add your default picklist value first'
          : 'Enter the next picklist value, or press RETURN to stop adding picklist values',
    });

    if (response.picklistValue === undefined || response.picklistValue === '') {
      keepAsking = false;
    } else {
      output.push({
        fullName: response.picklistValue,
        label: response.picklistValue,
        default: output.length === 0,
      });
    }
  }

  return {
    valueSetDefinition: {
      value: output,
      sorted: true,
    },
  };
};
