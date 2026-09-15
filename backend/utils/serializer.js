/**
 * LeadFlow CRM — Response Serializer & Compatibility Mapper
 *
 * Ensures 100% backward compatibility with existing frontend expectations:
 * 1. Attaches `_id: item.id` to every object.
 * 2. Converts Prisma Decimal objects to native JavaScript Numbers.
 * 3. Restores Mongoose populate() behavior where foreign key fields
 *    (e.g., assignedAgentId, managerId, companyId, contactId, leadId, userId, dealId)
 *    contain the populated object with both `_id` and `id`.
 */

function isDecimal(val) {
  return val !== null && typeof val === 'object' && (val.constructor?.name === 'Decimal' || typeof val.toNumber === 'function');
}

function serializeEntity(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  if (item instanceof Date) {
    return item;
  }

  if (isDecimal(item)) {
    return item.toNumber();
  }

  if (Array.isArray(item)) {
    return item.map(serializeEntity);
  }

  const result = {};

  for (const [key, value] of Object.entries(item)) {
    if (isDecimal(value)) {
      result[key] = value.toNumber();
    } else if (Array.isArray(value)) {
      result[key] = value.map(serializeEntity);
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = serializeEntity(value);
    } else {
      result[key] = value;
    }
  }

  // Ensure both `id` and `_id` are always present
  if (result.id && !result._id) {
    result._id = result.id;
  } else if (result._id && !result.id) {
    result.id = result._id;
  }

  // Restore Mongoose populate() semantics for relation objects
  if (result.assignedAgent && typeof result.assignedAgent === 'object') {
    result.assignedAgentId = serializeEntity(result.assignedAgent);
  }
  if (result.manager && typeof result.manager === 'object') {
    result.managerId = serializeEntity(result.manager);
  }
  if (result.company && typeof result.company === 'object') {
    result.companyId = serializeEntity(result.company);
  }
  if (result.contact && typeof result.contact === 'object') {
    result.contactId = serializeEntity(result.contact);
  }
  if (result.lead && typeof result.lead === 'object') {
    result.leadId = serializeEntity(result.lead);
  }
  if (result.deal && typeof result.deal === 'object') {
    result.dealId = serializeEntity(result.deal);
  }
  if (result.user && typeof result.user === 'object') {
    result.userId = serializeEntity(result.user);
  }

  return result;
}

const serialize = (data) => {
  if (Array.isArray(data)) {
    return data.map(serializeEntity);
  }
  return serializeEntity(data);
};

module.exports = {
  serialize,
  serializeEntity
};
