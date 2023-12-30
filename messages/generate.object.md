# summary

Generate metadata source files for a new custom object.

# description

This command is interactive and must be run in a Salesforce DX project directory. You're required to specify the object's label with the "--label" flag. The command uses this label to provide intelligent suggestions for other object properties, such as its API name and plural label.

All Salesforce objects are required to have a Name field, so this command also prompts you for the label and type of the Name field. Run the "sf metadata generate field" command to create additional fields for the object.

To reduce the number of prompts, use the "--use-default-features" flag to automatically enable some features, such as reporting and search on the object.

# flags.label.summary

The custom object's label.

# flags.use-default-features.summary

Enable all optional features without prompting.

# flags.use-default-features.description

Enables these features:

- Search: Allows users to find the custom object's records when they search, including SOSL.
- Feeds: Enables feed tracking.
- Reports: Allows reporting of the data in the custom object records.
- History: Enables object history tracking.
- Activities: Allows users to associate tasks and scheduled calendar events related to the custom object records.
- Bulk API: With Sharing and Streaming API, classifies the custom object as an Enterprise Application object.
- Sharing: With Bulk API and Streaming API, classifies the custom object as an Enterprise Application object.
- Streaming API: With Bulk API and Sharing, classifies the custom object as an Enterprise Application object.

# examples

- Create a custom object with the specified label and be prompted for additional information:

  <%= config.bin %> <%= command.id %> --label "My Object"

- Create a custom object and enable optional features without prompting:

  <%= config.bin %> <%= command.id %> --label "My Object" --use-default-features

# success

Created %s.

# success.advice

The first time you deploy your new custom object to a source-tracking org, the org creates additional properties and sets new defaults on it. For this reason, we recommend that you immediately retrieve the custom object so your local source files are updated with this new information.

# success.field

Run this command to add a field to your object: sf schema generate field --object %s --label "Your Field"

# prompts.sharingModel

Org-wide sharing model (default access level for the object's records):
