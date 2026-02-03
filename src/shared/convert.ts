/*
 * Copyright 2026, Salesforce, Inc.
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
import * as jsToXml from 'js2xmlparser';
import { XMLParser } from 'fast-xml-parser';
import type { IOptions } from 'js2xmlparser/lib/options.js';
import type { JsonMap } from '@salesforce/ts-types';
import type { CustomObject, CustomField } from '@salesforce/types/metadata';

const standardOptions: IOptions = {
  declaration: {
    include: true,
    encoding: 'UTF-8',
    version: '1.0',
  },
  format: {
    doubleQuotes: true,
  },
};

type WriteJSONasXMLInputs = {
  json: CustomField | CustomObject | JsonMap;
  type: string;
  options?: IOptions;
};

const convertJsonToXml = ({ json, type, options = standardOptions }: WriteJSONasXMLInputs): string =>
  jsToXml.parse(type, fixExistingDollarSign(json), options);

const fixExistingDollarSign = <T extends WriteJSONasXMLInputs['json']>(existing: T): T => {
  const existingCopy = { ...existing };
  if ('$' in existingCopy) {
    const temp = existingCopy.$;
    delete existingCopy.$;
    existingCopy['@'] = temp;
  }
  return existingCopy;
};

const parseXml = <T>(fileString: string, mainNodeName: string): T => {
  const parser = new XMLParser();
  return (parser.parse(fileString) as unknown as { [key: string]: T })[mainNodeName];
};

export { convertJsonToXml, parseXml };
