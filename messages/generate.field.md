# summary

Generate local metadata for a custom field on

# description

Interactively generate local metadata for a custom field. This requires that the custom object you're adding the field to be present locally

# flags.label.summary

The label of the field.

# flags.object.summary

The directory of the object folder

# flags.object.description

The directory of object you're adding the field to. Include **c if the object is custom. For example, `force-app/main/default/objects/MyObj**c`

If not provided, the command will prompt you to choose from your local objects.

# examples

- Create a field with a given Label (you'll be prompted to choose an object)

<%= config.bin %> <%= command.id %> --label "My Field"

- Specify a local path to the object's folder

<%= config.bin %> <%= command.id %> --label "My Field" -o force-app/main/default/objects/MyObj\_\_c

# prompts.type

Field type

# prompts.startingNumber

Starting number

# prompts.defaultValue

Default checkbox value

# prompts.scale

How many decimal places

# prompts.precision

How many total digits, including those decimal places

# prompts.inlineHelpText

User-facing help text (for those bubbles on the record page)

# prompts.required

Require at the database level on every records (consider requiring on layouts instead!)

# prompts.externalId

Use this field as an external ID

# prompts.securityClassification

Security Classification (how sensitive is this field's content

# error.bigObjects

This command does not support big objects.

# error.cmdt

This command does not support Custom Metadata Types

# success

Created %s.
