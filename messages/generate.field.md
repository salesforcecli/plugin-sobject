# summary

Generate metadata source files for a new custom field on a specified object.

# description

This command is interactive and must be run in a Salesforce DX project directory. You're required to specify the field's label with the "--label" flag. The command uses this label to provide intelligent suggestions for other field properties, such as its API name.

You can generate a custom field on either a standard object, such as Account, or a custom object. In both cases, the source files for the object must already exist in your local project before you run this command. If you create a relationship field, the source files for the parent object must also exist in your local directory.  Use the command "sf metadata retrieve -m CustomObject:<object>" to retrieve source files for both standard and custom objects from your org.  To create a custom object, run the "sf generate metadata sobject" command or use the Object Manager UI in your Salesforce org.

# flags.label.summary

The field's label.

# flags.object.summary

The directory that contains the object's source files.

# flags.object.description

The object source files in your local project are grouped in a directoy with the same name as the object. Custom object names always end in "__c". An example of the object directory for the Account standard object is "force-app/main/default/objects/Account" An example custom object directory is "force-app/main/default/objects/MyObject__c"

If you don't specify this flag, the command prompts you to choose from your local objects.

# examples

- Create a field with the specified label; the command prompts you for the object:

  <%= config.bin %> <%= command.id %> --label "My Field"

- Specify the local path to the object's folder:

  <%= config.bin %> <%= command.id %> --label "My Field" --object force-app/main/default/objects/MyObject__c

# prompts.type

Field type:

# prompts.startingNumber

Starting number:

# prompts.defaultValue

Default checkbox value:

# prompts.scale

Number of decimal places:

# prompts.precision

Total number of digits, including the decimal places:

# prompts.inlineHelpText

Help text (the text displayed when users hover over the Info icon next to this field):

# prompts.required

Does this field always require a value in order to save a record? (Tip: consider using layouts instead to require a value)

# prompts.externalId

Should this field be set as the unique record identifier from an external system?

# prompts.securityClassification

Security classification (how sensitive is this field's content):

# error.bigObjects

This command doesn't support big objects.

# error.cmdt

This command doesn't support custom metadata types.

# success

Created %s.
