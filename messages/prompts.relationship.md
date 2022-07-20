# lookupDeleteConstraint

What happens to this field when the parent is deleted

# lookupDeleteConstraint.setNull

If the parent record is deleted, the lookup field is cleared.

# lookupDeleteConstraint.restrict

Prevent the parent record from being deleted if there are lookups that refer to it

# lookupDeleteConstraint.cascade

Deletes the lookup record as well as associated lookup fields

# writeRequiresMasterRead

Allow write access if parent is readable

# reparentableMasterDetail

Allow reparenting
