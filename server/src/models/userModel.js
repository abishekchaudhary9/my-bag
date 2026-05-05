function mapUser(row) {
  return {
    id: String(row.id),
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    phone: row.phone || undefined,
    avatar: row.avatar || undefined,
    address: row.street
      ? {
          street: row.street,
          city: row.city,
          state: row.state,
          zip: row.zip,
          country: row.country,
        }
      : undefined,
    createdAt: row.created_at,
  };
}

module.exports = { mapUser };
