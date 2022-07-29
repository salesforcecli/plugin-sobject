# objectPrompt

What is the parent object for this relationship field?

# lookupDeleteConstraint

What happens to this field when the parent is deleted?

# lookupDeleteConstraint.setNull

Clear the value of this field.

# lookupDeleteConstraint.restrict

Don't allow the parent record from being deleted if there are lookup fields that refer to it.

# lookupDeleteConstraint.cascade

Delete the lookup record and the associated lookup fields.

# writeRequiresMasterRead

Allow write access if the parent is readable?

# reparentableMasterDetail

Allow reparenting to a different parent record?
