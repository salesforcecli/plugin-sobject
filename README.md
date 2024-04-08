**NOTE: This template for sf plugins is not yet offical. Please consult with the Platform CLI team before using this template.**

# plugin-template-sf

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-template-sf.svg?label=@salesforce/plugin-template-sf)](https://www.npmjs.com/package/@salesforce/plugin-template-sf) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-template-sf.svg)](https://npmjs.org/package/@salesforce/plugin-template-sf) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-template-sf/main/LICENSE.txt)

## Using the template

This repository provides a template for creating a plugin for the Salesforce CLI. To convert this template to a working plugin:

1. Please get in touch with the Platform CLI team. We want to help you develop your plugin.
2. Generate your plugin:

   ```
   sf plugins install dev
   sf dev generate plugin

   git init -b main
   git add . && git commit -m "chore: initial commit"
   ```

3. Create your plugin's repo in the salesforcecli github org
4. When you're ready, replace the contents of this README with the information you want.

## Learn about `sf` plugins

Salesforce CLI plugins are based on the [oclif plugin framework](https://oclif.io/docs/introduction). Read the [plugin developer guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_plugins.meta/sfdx_cli_plugins/cli_plugins_architecture_sf_cli.htm) to learn about Salesforce CLI plugin development.

This repository contains a lot of additional scripts and tools to help with general Salesforce node development and enforce coding standards. You should familiarize yourself with some of the [node developer packages](#tooling) used by Salesforce. There is also a default circleci config using the [release management orb](https://github.com/forcedotcom/npm-release-management-orb) standards.

Additionally, there are some additional tests that the Salesforce CLI will enforce if this plugin is ever bundled with the CLI. These test are included by default under the `posttest` script and it is required to keep these tests active in your plugin if you plan to have it bundled.

### Tooling

- [@salesforce/core](https://github.com/forcedotcom/sfdx-core)
- [@salesforce/kit](https://github.com/forcedotcom/kit)
- [@salesforce/sf-plugins-core](https://github.com/salesforcecli/sf-plugins-core)
- [@salesforce/ts-types](https://github.com/forcedotcom/ts-types)
- [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon)
- [@salesforce/dev-config](https://github.com/forcedotcom/dev-config)
- [@salesforce/dev-scripts](https://github.com/forcedotcom/dev-scripts)

# Everything past here is only a suggestion as to what should be in your specific plugin's description

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands bundled with the CLI, however, you can install a specific version or tag if needed.

## Install

```bash
sf plugins install @salesforce/plugin-template-sf@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-template-sf

# Install the dependencies and compile
yarn && yarn build
```

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev hello world
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins link .
# To verify
sf plugins
```

## Commands

<!-- commands -->

- [`sf schema generate field`](#sf-schema-generate-field)
- [`sf schema generate platformevent`](#sf-schema-generate-platformevent)
- [`sf schema generate sobject`](#sf-schema-generate-sobject)
- [`sf schema generate tab`](#sf-schema-generate-tab)

## `sf schema generate field`

Generate metadata source files for a new custom field on a specified object.

```
USAGE
  $ sf schema generate field -l <value> [--flags-dir <value>] [-o <value>]

FLAGS
  -l, --label=<value>   (required) The field's label.
  -o, --object=<value>  The directory that contains the object's source files.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.

DESCRIPTION
  Generate metadata source files for a new custom field on a specified object.

  This command is interactive and must be run in a Salesforce DX project directory. You're required to specify the
  field's label with the "--label" flag. The command uses this label to provide intelligent suggestions for other field
  properties, such as its API name.

  You can generate a custom field on either a standard object, such as Account, or a custom object. In both cases, the
  source files for the object must already exist in your local project before you run this command. If you create a
  relationship field, the source files for the parent object must also exist in your local directory.  Use the command
  "sf metadata retrieve -m CustomObject:<object>" to retrieve source files for both standard and custom objects from
  your org.  To create a custom object, run the "sf generate metadata sobject" command or use the Object Manager UI in
  your Salesforce org.

ALIASES
  $ sf generate metadata field

EXAMPLES
  Create a field with the specified label; the command prompts you for the object:

    $ sf schema generate field --label "My Field"

  Specify the local path to the object's folder:

    $ sf schema generate field --label "My Field" --object force-app/main/default/objects/MyObject__c

FLAG DESCRIPTIONS
  -o, --object=<value>  The directory that contains the object's source files.

    The object source files in your local project are grouped in a directoy with the same name as the object. Custom
    object names always end in "__c". An example of the object directory for the Account standard object is
    "force-app/main/default/objects/Account" An example custom object directory is
    "force-app/main/default/objects/MyObject__c"

    If you don't specify this flag, the command prompts you to choose from your local objects.
```

_See code: [src/commands/schema/generate/field.ts](https://github.com/salesforcecli/plugin-sobject/blob/1.2.2/src/commands/schema/generate/field.ts)_

## `sf schema generate platformevent`

Generate metadata source files for a new platform event.

```
USAGE
  $ sf schema generate platformevent -l <value> [--flags-dir <value>]

FLAGS
  -l, --label=<value>  (required) The platform event's label.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.

DESCRIPTION
  Generate metadata source files for a new platform event.

  This command is interactive and must be run in a Salesforce DX project directory. You're required to specify the
  event's label with the "--label" flag. The command uses this label to provide intelligent suggestions for other event
  properties, such as its API name.

ALIASES
  $ sf generate metadata platformevent

EXAMPLES
  Create a platform event with the specified label:

    $ sf schema generate platformevent --label "My Platform Event"
```

_See code: [src/commands/schema/generate/platformevent.ts](https://github.com/salesforcecli/plugin-sobject/blob/1.2.2/src/commands/schema/generate/platformevent.ts)_

## `sf schema generate sobject`

Generate metadata source files for a new custom object.

```
USAGE
  $ sf schema generate sobject -l <value> [--flags-dir <value>] [-f]

FLAGS
  -f, --use-default-features  Enable all optional features without prompting.
  -l, --label=<value>         (required) The custom object's label.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.

DESCRIPTION
  Generate metadata source files for a new custom object.

  This command is interactive and must be run in a Salesforce DX project directory. You're required to specify the
  object's label with the "--label" flag. The command uses this label to provide intelligent suggestions for other
  object properties, such as its API name and plural label.

  All Salesforce objects are required to have a Name field, so this command also prompts you for the label and type of
  the Name field. Run the "sf metadata generate field" command to create additional fields for the object.

  To reduce the number of prompts, use the "--use-default-features" flag to automatically enable some features, such as
  reporting and search on the object.

ALIASES
  $ sf generate metadata sobject

EXAMPLES
  Create a custom object with the specified label and be prompted for additional information:

    $ sf schema generate sobject --label "My Object"

  Create a custom object and enable optional features without prompting:

    $ sf schema generate sobject --label "My Object" --use-default-features

FLAG DESCRIPTIONS
  -f, --use-default-features  Enable all optional features without prompting.

    Enables these features:

    - Search: Allows users to find the custom object's records when they search, including SOSL.
    - Feeds: Enables feed tracking.
    - Reports: Allows reporting of the data in the custom object records.
    - History: Enables object history tracking.
    - Activities: Allows users to associate tasks and scheduled calendar events related to the custom object records.
    - Bulk API: With Sharing and Streaming API, classifies the custom object as an Enterprise Application object.
    - Sharing: With Bulk API and Streaming API, classifies the custom object as an Enterprise Application object.
    - Streaming API: With Bulk API and Sharing, classifies the custom object as an Enterprise Application object.
```

_See code: [src/commands/schema/generate/sobject.ts](https://github.com/salesforcecli/plugin-sobject/blob/1.2.2/src/commands/schema/generate/sobject.ts)_

## `sf schema generate tab`

Generate the metadata source files for a new custom tab on a custom object.

```
USAGE
  $ sf schema generate tab -o <value> -d <value> -i <value> [--json] [--flags-dir <value>]

FLAGS
  -d, --directory=<value>  (required) Path to a "tabs" directory that will contain the source files for your new tab.
  -i, --icon=<value>       (required) [default: 1] Number from 1 to 100 that specifies the color scheme and icon for the
                           custom tab.
  -o, --object=<value>     (required) API name of the custom object you're generating a tab for.

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Generate the metadata source files for a new custom tab on a custom object.

  Custom tabs let you display custom object data or other web content in Salesforce. Custom tabs appear in Salesforce as
  an item in the app’s navigation bar and in the App Launcher.

  This command must be run in a Salesforce DX project directory. You must pass all required information to it with the
  required flags. The source files for the custom object for which you're generating a tab don't need to exist in your
  local project.

ALIASES
  $ sf generate metadata tab

EXAMPLES
  Create a tab on the `MyObject__c` custom object:

    $ sf schema generate tab --object `MyObject__c` --icon 54 --directory force-app/main/default/tabs

FLAG DESCRIPTIONS
  -i, --icon=<value>  Number from 1 to 100 that specifies the color scheme and icon for the custom tab.

    See https://lightningdesignsystem.com/icons/#custom for the available icons.

  -o, --object=<value>  API name of the custom object you're generating a tab for.

    The API name for a custom object always ends in `__c`, such as `MyObject__c`.
```

_See code: [src/commands/schema/generate/tab.ts](https://github.com/salesforcecli/plugin-sobject/blob/1.2.2/src/commands/schema/generate/tab.ts)_

<!-- commandsstop -->
