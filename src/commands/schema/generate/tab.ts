/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs  from 'node:fs';
import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { CustomTab } from 'jsforce/api/metadata';
import { isTabsFolder } from '../../../shared/flags.js';
import { convertJsonToXml } from '../../../shared/convert.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-sobject', 'generate.tab');

export type GenerateTabResult = {
  tab: Pick<CustomTab, 'customObject' | 'motif'>;
  path: string;
};

export default class GenerateTab extends SfCommand<GenerateTabResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly aliases = ['generate:metadata:tab'];
  public static readonly deprecateAliases = true;

  public static readonly flags = {
    object: Flags.string({
      summary: messages.getMessage('flags.object.summary'),
      description: messages.getMessage('flags.object.description'),
      char: 'o',
      required: true,
    }),
    directory: Flags.directory({
      summary: messages.getMessage('flags.directory.summary'),
      char: 'd',
      required: true,
      exists: true,
      parse: async (input) => isTabsFolder(input),
    }),
    icon: Flags.integer({
      char: 'i',
      required: true,
      min: 1,
      max: 100,
      default: 1,
      summary: messages.getMessage('flags.icon.summary'),
      description: messages.getMessage('flags.icon.description'),
    }),
  };

  public async run(): Promise<GenerateTabResult> {
    const { flags } = await this.parse(GenerateTab);
    const tabPath = path.join(flags.directory, `${flags.object}.tab-meta.xml`);

    const tab: GenerateTabResult['tab'] = {
      customObject: true,
      motif: tabDefs.find((tabDef) => tabDef.includes(`Custom${flags.icon}:`)),
    };
    await fs.promises.writeFile(tabPath, convertJsonToXml({ json: tab, type: 'CustomTab' }));
    this.logSuccess(messages.getMessage('success', [tabPath]));
    return {
      tab,
      path: tabPath,
    };
  }
}

const tabDefs = [
  'Custom20: Airplane',
  'Custom25: Alarm clock',
  'Custom51: Apple',
  'Custom52: Balls',
  'Custom16: Bank',
  'Custom53: Bell',
  'Custom50: Big top',
  'Custom54: Boat',
  'Custom55: Books',
  'Custom56: Bottle',
  'Custom13: Box',
  'Custom37: Bridge',
  'Custom24: Building',
  'Custom57: Building Block',
  'Custom58: Caduceus',
  'Custom38: Camera',
  'Custom59: Can',
  'Custom31: Car',
  'Custom61: Castle',
  'Custom49: CD/DVD',
  'Custom28: Cell phone',
  'Custom62: Chalkboard',
  'Custom47: Knight',
  'Custom63: Chip',
  'Custom12: Circle',
  'Custom64: Compass',
  'Custom21: Computer',
  'Custom40: Credit card',
  'Custom99: TV CRT',
  'Custom65: Cup',
  'Custom33: Desk',
  'Custom8: Diamond',
  'Custom66: Dice',
  'Custom32: Factory',
  'Custom2: Fan',
  'Custom26: Flag',
  'Custom18: Form',
  'Custom67: Gears',
  'Custom68: Globe',
  'Custom69: Guitar',
  'Custom44: Hammer',
  'Custom14: Hands',
  'Custom70: Handsaw',
  'Custom71: Headset',
  'Custom1: Heart',
  'Custom72: Helicopter',
  'Custom4: Hexagon ',
  'Custom73: Highway Sign',
  'Custom74: Hot Air Balloon',
  'Custom34: Insect',
  'Custom75: IP Phone',
  'Custom43: Jewel',
  'Custom76: Keys',
  'Custom27: Laptop',
  'Custom5: Leaf',
  'Custom9: Lightning',
  'Custom77: Locked',
  'Custom23: Envelope',
  'Custom78: Map',
  'Custom79: Measuring Tape',
  'Custom35: Microphone',
  'Custom10: Moon',
  'Custom80: Motorcycle',
  'Custom81: Musical Note',
  'Custom29: PDA',
  'Custom83: Pencil',
  'Custom15: People',
  'Custom22: Telephone',
  'Custom46: Stamp',
  'Custom84: Presenter',
  'Custom30: Radar dish',
  'Custom85: Real Estate Sign',
  'Custom86: Red Cross',
  'Custom17: Sack',
  'Custom87: Safe',
  'Custom88: Sailboat',
  'Custom89: Saxophone',
  'Custom90: Scales',
  'Custom91: Shield',
  'Custom92: Ship',
  'Custom93: Shopping Cart',
  'Custom7: Square',
  'Custom41: Cash',
  'Custom11: Star',
  'Custom94: Stethoscope',
  'Custom95: Stopwatch',
  'Custom96: Street Sign',
  'Custom3: Sun',
  'Custom39: Telescope',
  'Custom97: Thermometer',
  'Custom45: Ticket',
  'Custom36: Train',
  'Custom42: Treasure chest',
  'Custom6: Triangle',
  'Custom48: Trophy',
  'Custom98: Truck',
  'Custom100: TV Widescreen',
  'Custom60: Umbrella',
  'Custom82: Whistle',
  'Custom19: Wrench',
];
