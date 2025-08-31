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
