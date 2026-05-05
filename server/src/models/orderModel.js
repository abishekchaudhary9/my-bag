function toDateString(value) {
  return new Date(value).toISOString().split("T")[0];
}

function mapOrder(row, items) {
  return {
    id: row.order_number,
    date: toDateString(row.created_at),
    status: row.status,
    items: items.map((item) => ({
      name: item.product_name,
      color: item.color,
      size: item.size,
      qty: item.qty,
      price: parseFloat(item.price),
      image: item.image || "",
    })),
    subtotal: parseFloat(row.subtotal),
    shipping: parseFloat(row.shipping),
    discount: parseFloat(row.discount),
    total: parseFloat(row.total),
    trackingNumber: row.tracking_number || undefined,
  };
}

module.exports = { mapOrder, toDateString };
