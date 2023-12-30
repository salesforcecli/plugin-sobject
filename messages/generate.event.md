# summary

Generate metadata source files for a new platform event.

# description

This command is interactive and must be run in a Salesforce DX project directory. You're required to specify the event's label with the "--label" flag. The command uses this label to provide intelligent suggestions for other event properties, such as its API name.

# flags.label.summary

The platform event's label.

# examples

- Create a platform event with the specified label:

  <%= config.bin %> <%= command.id %> --label "My Platform Event"

# prompts.publishBehavior

Do you want platform events to publish after a transaction completes, or immediately?

# success.field

Run this command to add a field to your event: sf schema generate field --object %s --label "Your Field"
