/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { CustomObject, CustomField } from '@salesforce/types/metadata';

/** Used by classical CustomObject */
export type NameField = Pick<CustomField, 'label' | 'type' | 'displayFormat'>;

/** This type represents a PlatformEvent that can deploy.*/
export type SaveablePlatformEvent = Pick<
  CustomObject,
  'fullName' | 'label' | 'deploymentStatus' | 'description' | 'pluralLabel' | 'eventType' | 'publishBehavior'
>;

/** This type represents a "classical" CustomObject subset that can deploy. */
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
