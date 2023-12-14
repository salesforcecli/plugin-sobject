/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import type { CustomObject } from 'jsforce/api/metadata';
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
