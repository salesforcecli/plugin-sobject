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

import { expect } from 'chai';
import { Messages } from '@salesforce/core/messages';
import { integerValidation, makeNameApiCompatible } from '../../src/shared/prompts/functions.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'prompts.shared');

describe('integer validation for prompts', () => {
  it('fail max gt', () => {
    expect(integerValidation({ min: 1, max: 10 })('11')).to.equal(messages.getMessage('numberValidationMax', [11, 10]));
  });
  it('fail min', () => {
    expect(integerValidation({ min: 1, max: 10 })('0')).to.equal(messages.getMessage('numberValidationMin', [0, 1]));
  });
  it('pass = min', () => {
    expect(integerValidation({ min: 1, max: 10 })('1')).to.equal(true);
  });
  it('pass = max', () => {
    expect(integerValidation({ min: 1, max: 10 })('10')).to.equal(true);
  });
  it('pass inside range', () => {
    expect(integerValidation({ min: 1, max: 10 })('5')).to.equal(true);
  });
});

describe('api name compatibility', () => {
  it('handles spaces', () => {
    expect(makeNameApiCompatible('foo bar')).to.equal('foobar');
    expect(makeNameApiCompatible('foo   bar')).to.equal('foobar');
  });
  it('handles hyphens', () => {
    expect(makeNameApiCompatible('foo-bar')).to.equal('foo_bar');
    expect(makeNameApiCompatible('foo---bar')).to.equal('foo_bar');
  });
  it('handles multiple underscores', () => {
    expect(makeNameApiCompatible('foo__bar')).to.equal('foo_bar');
    expect(makeNameApiCompatible('foo_____bar')).to.equal('foo_bar');
  });
});
