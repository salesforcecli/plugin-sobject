/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { CustomObject, CustomField } from 'jsforce/api/metadata';

/** Used to capture the types for NameField in the inquirer prompts */
export type NameFieldResponse = {
  nameFieldType: 'Text' | 'AutoNumber';
  nameFieldLabel: 'string';
  autoNumberFormat?: string;
};

/** Used by classical CustomObject */
type NameField = Pick<CustomField, 'label' | 'type' | 'displayFormat'>;

/**
 * There are a lot of properties that we don't, and some that jsforce thinks are mandatory that aren't.
 * Many apply to the various sub-species (mdt, external, events)
 *
 * This type represents a PlatformEvent that can deploy.
 */ export type SaveablePlatformEvent = Pick<
  CustomObject,
  'fullName' | 'label' | 'deploymentStatus' | 'description' | 'pluralLabel' | 'eventType' | 'publishBehavior'
>;

/**
 * There are a lot of properties that we don't, and some that jsforce thinks are mandatory that aren't.
 * Many apply to the various sub-species (mdt, external, events)
 *
 * This type represents a "classical" CustomObject subset that can deploy.
 */
export type SaveableCustomObject = Pick<
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
> & { nameField: NameField };
