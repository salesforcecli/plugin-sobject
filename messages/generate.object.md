# summary

Generate local metadata for a custom object

# description

Interactively generate local metadata for a custom object

# flags.label.summary

The label of the object.

# flags.use-default-features.summary

Enable all optional features without prompting.

# flags.use-default-features.description

Enables search, feeds, reports, history, activities, bulk API, sharing, and streaming API.

# examples

- Create an object with a given Label and be prompted for additional information

<%= config.bin %> <%= command.id %> --label "My Object"

- Create an object and opt in to most defaults (see flag help for details)

<%= config.bin %> <%= command.id %> --label "My Object" --use-default-features

# success

Created %s

# success.advice

If you deploy the file to a source-tracking org, you will want to retrieve the result since additional properties and defaults will be created in the org

# success.field

Add a field with <%= config.bin %> generate metadata field -o %s -l "Your Field"

# prompts.sharingModel

Org wide sharing model
