'use strict';

// Category tree for the Pachankaun MVP. Fixed UUIDs so the field-definition
// and demo-business seeders can reference them deterministically.
const CATEGORIES = [
  { id: '11111111-0000-0000-0000-000000000001', name_en: 'Food & Dining', name_hi: 'खान-पान', slug: 'food-dining', parent: null, order: 1 },
  { id: '11111111-0000-0000-0000-000000000002', name_en: 'Restaurant', name_hi: 'रेस्टोरेंट', slug: 'restaurant', parent: 0, order: 1, leaf: true },
  { id: '11111111-0000-0000-0000-000000000003', name_en: 'Pure Veg Restaurant', name_hi: 'शुद्ध शाकाहारी रेस्टोरेंट', slug: 'pure-veg-restaurant', parent: 1, order: 2, leaf: true },
  { id: '11111111-0000-0000-0000-000000000004', name_en: 'Healthcare', name_hi: 'स्वास्थ्य सेवा', slug: 'healthcare', parent: null, order: 2 },
  { id: '11111111-0000-0000-0000-000000000005', name_en: 'Doctor', name_hi: 'डॉक्टर', slug: 'doctor', parent: 3, order: 1, leaf: true },
  { id: '11111111-0000-0000-0000-000000000006', name_en: 'Beauty & Wellness', name_hi: 'सौंदर्य एवं सेहत', slug: 'beauty-wellness', parent: null, order: 3 },
  { id: '11111111-0000-0000-0000-000000000007', name_en: 'Salon', name_hi: 'सैलून', slug: 'salon', parent: 5, order: 1, leaf: true },
  { id: '11111111-0000-0000-0000-000000000008', name_en: 'Construction & Materials', name_hi: 'निर्माण एवं सामग्री', slug: 'construction-materials', parent: null, order: 4 },
  { id: '11111111-0000-0000-0000-000000000009', name_en: 'Stone Crusher', name_hi: 'स्टोन क्रशर', slug: 'stone-crusher', parent: 7, order: 1, leaf: true },
  { id: '11111111-0000-0000-0000-000000000010', name_en: 'Building Material Supplier', name_hi: 'निर्माण सामग्री आपूर्तिकर्ता', slug: 'building-material-supplier', parent: 7, order: 2, leaf: true },
  { id: '11111111-0000-0000-0000-000000000011', name_en: 'Retail Shop', name_hi: 'रिटेल दुकान', slug: 'retail-shop', parent: null, order: 5 },
  { id: '11111111-0000-0000-0000-000000000012', name_en: 'Grocery Store', name_hi: 'किराना दुकान', slug: 'grocery-store', parent: 10, order: 1, leaf: true },
  { id: '11111111-0000-0000-0000-000000000013', name_en: 'Home Services', name_hi: 'होम सर्विसेज', slug: 'home-services', parent: null, order: 6 },
  { id: '11111111-0000-0000-0000-000000000014', name_en: 'Plumber', name_hi: 'प्लंबर', slug: 'plumber', parent: 12, order: 1, leaf: true },
  { id: '11111111-0000-0000-0000-000000000015', name_en: 'Electrician', name_hi: 'इलेक्ट्रीशियन', slug: 'electrician', parent: 12, order: 2, leaf: true }
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    // `parent` index in the array above resolves to the parent's UUID
    const rows = CATEGORIES.map((c) => ({
      id: c.id,
      name_en: c.name_en,
      name_hi: c.name_hi,
      slug: c.slug,
      parent_id: c.parent === null ? null : CATEGORIES[c.parent].id,
      display_order: c.order,
      is_active: true,
      is_leaf: Boolean(c.leaf),
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('categories', rows, {});
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', {
      id: CATEGORIES.map((c) => c.id)
    }, {});
  }
};
