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
import { expect } from 'chai';
import type { CustomObject } from '@salesforce/types/metadata';
import { parseXml } from '../../src/shared/convert.js';

// tests configurations of the xml parser
describe('builds deployable objects', () => {
  it('parses an object file xml', () => {
    const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <actionOverrides>
        <actionName>Accept</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>CancelEdit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Clone</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Delete</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Edit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Follow</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>List</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>New</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>SaveEdit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Tab</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>View</actionName>
        <type>Default</type>
    </actionOverrides>
    <allowInChatterGroups>false</allowInChatterGroups>
    <compactLayoutAssignment>HEDA_Address_Compact_Layout</compactLayoutAssignment>
    <deploymentStatus>Deployed</deploymentStatus>
    <description>Stores address information. To support multiple and seasonal addresses.</description>
    <enableActivities>false</enableActivities>
    <enableBulkApi>true</enableBulkApi>
    <enableFeeds>true</enableFeeds>
    <enableHistory>false</enableHistory>
    <enableReports>true</enableReports>
    <enableSearch>true</enableSearch>
    <enableSharing>true</enableSharing>
    <enableStreamingApi>true</enableStreamingApi>
    <label>Address</label>
    <nameField>
        <displayFormat>A-{00000}</displayFormat>
        <label>Address ID</label>
        <trackFeedHistory>false</trackFeedHistory>
        <type>AutoNumber</type>
    </nameField>
    <pluralLabel>Addresses</pluralLabel>
    <searchLayouts>
        <lookupDialogsAdditionalFields>Formula_MailingAddress__c</lookupDialogsAdditionalFields>
        <lookupDialogsAdditionalFields>Parent_Account__c</lookupDialogsAdditionalFields>
        <lookupDialogsAdditionalFields>Address_Type__c</lookupDialogsAdditionalFields>
        <lookupPhoneDialogsAdditionalFields>Formula_MailingAddress__c</lookupPhoneDialogsAdditionalFields>
        <lookupPhoneDialogsAdditionalFields>Parent_Account__c</lookupPhoneDialogsAdditionalFields>
        <lookupPhoneDialogsAdditionalFields>Address_Type__c</lookupPhoneDialogsAdditionalFields>
        <searchFilterFields>Formula_MailingAddress__c</searchFilterFields>
        <searchFilterFields>Parent_Account__c</searchFilterFields>
        <searchFilterFields>Address_Type__c</searchFilterFields>
    </searchLayouts>
    <sharingModel>ReadWrite</sharingModel>
    <startsWith>Vowel</startsWith>
</CustomObject>
    `;

    const result = parseXml<CustomObject>(xml, 'CustomObject');
    expect(result).to.have.property('pluralLabel', 'Addresses');
  });
});
