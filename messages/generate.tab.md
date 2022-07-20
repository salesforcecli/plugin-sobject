# summary

Generate a tab for a custom object.

# description

Description of a command.

# flags.object.summary

API name of the object to generate a tab for.

# flags.object.description

API name of the object to generate a tab for. Custom objects should end in \_\_c. The object need not be present in your local source.

# flags.directory.summary

Path to a `tabs` folder that your new tab will be created in.

# flags.icon.summary

An icon number from <https://lightningdesignsystem.com/icons/#custom> from 1 to 100'

# examples

- <%= config.bin %> <%= command.id %> -o MyObj\_\_c -i 54 -d force-app/main/default/tabs

# success

Generated a tab file at %s.
