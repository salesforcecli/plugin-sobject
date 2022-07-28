/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Messages } from '@salesforce/core';
import { integerValidation, makeNameApiCompatible } from '../../src/shared/prompts/prompts';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-schema-generator', 'prompts.shared', [
  'numberValidationMin',
  'numberValidationMax',
]);

describe('integer validation for prompts', () => {
  it('fail max gt', () => {
    expect(integerValidation(11, 1, 10)).to.equal(messages.getMessage('numberValidationMax', [11, 10]));
  });
  it('fail min', () => {
    expect(integerValidation(0, 1, 10)).to.equal(messages.getMessage('numberValidationMin', [0, 1]));
  });
  it('pass = min', () => {
    expect(integerValidation(1, 1, 10)).to.equal(true);
  });
  it('pass = max', () => {
    expect(integerValidation(10, 1, 10)).to.equal(true);
  });
  it('pass inside range', () => {
    expect(integerValidation(5, 1, 10)).to.equal(true);
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
