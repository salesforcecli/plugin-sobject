# summary

Generate the metadata source files for a new custom tab on a custom object.

# description

Custom tabs let you display custom object data or other web content in Salesforce. Custom tabs appear in Salesforce as an item in the app’s navigation bar and in the App Launcher.

This command must be run in a Salesforce DX project directory. You must pass all required information to it with the required flags. The source files for the custom object for which you're generating a tab don't need to exist in your local project.

# flags.object.summary

API name of the custom object you're generating a tab for.

# flags.object.description

The API name for a custom object always ends in `__c`, such as `MyObject__c`.

# flags.directory.summary

Path to a "tabs" directory that will contain the source files for your new tab.

# flags.icon.summary

Number from 1 to 100 that specifies the color scheme and icon for the custom tab.

# flags.icon.description

See https://lightningdesignsystem.com/icons/#custom for the available icons.

# examples

- Create a tab on the `MyObject__c` custom object:

  <%= config.bin %> <%= command.id %> --object `MyObject__c` --icon 54 --directory force-app/main/default/tabs

# success

Generated a tab file at %s.
