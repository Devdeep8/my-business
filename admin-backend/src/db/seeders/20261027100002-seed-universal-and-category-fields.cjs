'use strict';

// Form field definitions: universal fields (null category_id, appear on every
// business form) plus per-leaf-category fields. Category fields inherit down
// the tree automatically at resolve time (implemented in the form service).
const FIELDS = [
  // ---- Universal ----
  { key: 'gstin', type: 'text', category: null, order: 90,
    label_en: 'GSTIN (optional)', label_hi: 'जीएसटीआईएन (वैकल्पिक)',
    help_en: '15-character GST number if registered', help_hi: 'पंजीकृत हो तो 15 अक्षर का जीएसटी नंबर',
    validation: { pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$', required: false } },
  { key: 'payment_modes', type: 'multi_select', category: null, order: 91,
    label_en: 'Payment modes accepted', label_hi: 'भुगतान के तरीके',
    options: ['cash', 'upi', 'card', 'bank_transfer', 'cheque'] },
  { key: 'home_delivery', type: 'boolean', category: null, order: 92,
    label_en: 'Home delivery available', label_hi: 'होम डिलीवरी उपलब्ध',
    show_on_profile: true },

  // ---- Restaurant ----
  { category: 'restaurant', order: 10,
    key: 'cuisines', type: 'multi_select',
    label_en: 'Cuisines', label_hi: 'व्यंजन',
    options: ['north_indian', 'south_indian', 'chinese', 'continental', 'mughlai', 'fast_food', 'street_food'],
    validation: { required: true, minItems: 1 } },
  { category: 'restaurant', order: 11,
    key: 'price_range', type: 'select',
    label_en: 'Price range', label_hi: 'कीमत श्रेणी',
    options: ['₹', '₹₹', '₹₹₹'] },
  { category: 'restaurant', order: 12,
    key: 'is_pure_veg', type: 'boolean',
    label_en: 'Pure vegetarian', label_hi: 'शुद्ध शाकाहारी' },
  { category: 'restaurant', order: 13,
    key: 'seating_capacity', type: 'number',
    label_en: 'Seating capacity', label_hi: 'बैठने की क्षमता',
    validation: { min: 0, max: 10000 } },
  { category: 'restaurant', order: 14,
    key: 'menu_url', type: 'url',
    label_en: 'Menu link', label_hi: 'मेन्यू लिंक' },

  // ---- Doctor ----
  { category: 'doctor', order: 10,
    key: 'specialization', type: 'multi_select',
    label_en: 'Specialization', label_hi: 'विशेषज्ञता',
    options: ['general_physician', 'pediatrician', 'orthopedic', 'gynecologist', 'dentist', 'ayurvedic', 'homeopathic'],
    validation: { required: true, minItems: 1 } },
  { category: 'doctor', order: 11,
    key: 'registration_no', type: 'text',
    label_en: 'Medical registration number', label_hi: 'मेडिकल रजिस्ट्रेशन नंबर',
    validation: { required: true, maxLength: 50 } },
  { category: 'doctor', order: 12,
    key: 'appointment_url', type: 'url',
    label_en: 'Appointment booking link', label_hi: 'अपॉइंटमेंट बुकिंग लिंक' },

  // ---- Salon ----
  { category: 'salon', order: 10,
    key: 'services', type: 'multi_select',
    label_en: 'Services offered', label_hi: 'दी जाने वाली सेवाएँ',
    options: ['haircut', 'shaving', 'facial', 'bridal_makeup', 'hair_color', 'massage'],
    validation: { required: true, minItems: 1 } },
  { category: 'salon', order: 11,
    key: 'home_service', type: 'boolean',
    label_en: 'Home service available', label_hi: 'घर पर सेवा उपलब्ध' },

  // ---- Stone Crusher ----
  { category: 'stone-crusher', order: 10,
    key: 'materials', type: 'multi_select',
    label_en: 'Materials available', label_hi: 'उपलब्ध सामग्री',
    options: ['ret', 'gitti', 'dust', 'khadka'],
    validation: { required: true, minItems: 1 } },
  { category: 'stone-crusher', order: 11,
    key: 'capacity_tph', type: 'number',
    label_en: 'Crushing capacity (TPH)', label_hi: 'क्रशिंग क्षमता (टन प्रति घंटा)',
    validation: { min: 1 } },
  { category: 'stone-crusher', order: 12,
    key: 'transport_available', type: 'boolean',
    label_en: 'Transport / delivery available', label_hi: 'परिवहन / डिलीवरी उपलब्ध' },

  // ---- Plumber ----
  { category: 'plumber', order: 10,
    key: 'free_estimate', type: 'boolean',
    label_en: 'Free estimates', label_hi: 'मुफ्त अनुमान' },
  { category: 'plumber', order: 11,
    key: 'emergency_24x7', type: 'boolean',
    label_en: '24x7 emergency service', label_hi: '24x7 इमरजेंसी सेवा' }
];

const CATEGORY_SLUG_TO_ID = {
  'restaurant': '11111111-0000-0000-0000-000000000002',
  'doctor': '11111111-0000-0000-0000-000000000005',
  'salon': '11111111-0000-0000-0000-000000000007',
  'stone-crusher': '11111111-0000-0000-0000-000000000009',
  'plumber': '11111111-0000-0000-0000-000000000014'
};

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    // queryInterface.bulkInsert has no model type info, so JSONB values must
    // be passed as strings (plain objects are rejected by the SQL escaper).
    const rows = FIELDS.map((f) => ({
      id: require('crypto').randomUUID(),
      category_id: f.category === null ? null : CATEGORY_SLUG_TO_ID[f.category],
      key: f.key,
      label_en: f.label_en,
      label_hi: f.label_hi,
      type: f.type,
      options: f.options ? JSON.stringify({ options: f.options }) : null,
      validation: JSON.stringify(f.validation || { required: false }),
      help_text_en: f.help_en || null,
      help_text_hi: f.help_hi || null,
      display_order: f.order,
      show_on_profile: f.show_on_profile !== false,
      visible_if: null,
      is_active: true,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('field_definitions', rows, {});
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('field_definitions', {
      key: FIELDS.map((f) => f.key)
    }, {});
  }
};
