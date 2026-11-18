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
  { category: 'doctor', order: 13,
    key: 'consultation_timings', type: 'repeater',
    label_en: 'Consultation timings', label_hi: 'सलाह के समय',
    validation: { required: false, repeater_fields: [
      { key: 'day', label: { en: 'Day', hi: 'दिन' }, type: 'select', required: true, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { key: 'opens', label: { en: 'Opens', hi: 'खुलने का समय' }, type: 'text', required: true },
      { key: 'closes', label: { en: 'Closes', hi: 'बंद होने का समय' }, type: 'text', required: true }
    ] } },
  { category: 'doctor', order: 14,
    key: 'consultation_fee', type: 'number',
    label_en: 'Consultation fee', label_hi: 'परामर्श शुल्क', validation: { min: 0 } },

  // ---- Salon ----
  { category: 'salon', order: 10,
    key: 'services', type: 'multi_select',
    label_en: 'Services offered', label_hi: 'दी जाने वाली सेवाएँ',
    options: ['haircut', 'shaving', 'facial', 'bridal_makeup', 'hair_color', 'massage'],
    validation: { required: true, minItems: 1 } },
  { category: 'salon', order: 11,
    key: 'home_service', type: 'boolean',
    label_en: 'Home service available', label_hi: 'घर पर सेवा उपलब्ध' },
  { category: 'salon', order: 12,
    key: 'service_menu', type: 'repeater',
    label_en: 'Service menu', label_hi: 'सेवा सूची',
    validation: { required: false, repeater_fields: [
      { key: 'name', label: { en: 'Service', hi: 'सेवा' }, type: 'text', required: true },
      { key: 'price', label: { en: 'Starting price', hi: 'शुरुआती कीमत' }, type: 'number', required: false },
      { key: 'duration', label: { en: 'Duration', hi: 'अवधि' }, type: 'text', required: false }
    ] } },

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
    label_en: '24x7 emergency service', label_hi: '24x7 इमरजेंसी सेवा' },

  // ---- Pure veg restaurant ----
  { category: 'pure-veg-restaurant', order: 10, key: 'cuisines', type: 'multi_select', label_en: 'Cuisines', label_hi: 'व्यंजन', options: ['north_indian', 'south_indian', 'chinese', 'continental', 'mughlai', 'fast_food', 'street_food'], validation: { required: true, minItems: 1 } },
  { category: 'pure-veg-restaurant', order: 11, key: 'price_range', type: 'select', label_en: 'Price range', label_hi: 'कीमत श्रेणी', options: ['₹', '₹₹', '₹₹₹'] },
  { category: 'pure-veg-restaurant', order: 12, key: 'is_pure_veg', type: 'boolean', label_en: 'Pure vegetarian', label_hi: 'शुद्ध शाकाहारी', validation: { required: true } },
  { category: 'pure-veg-restaurant', order: 13, key: 'seating_capacity', type: 'number', label_en: 'Seating capacity', label_hi: 'बैठने की क्षमता', validation: { min: 0, max: 10000 } },

  // ---- Repeatable catalogue / menu fields ----
  { category: 'restaurant', order: 15,
    key: 'menu_items', type: 'repeater',
    label_en: 'Menu items', label_hi: 'मेन्यू आइटम',
    validation: { required: false, minItems: 1, repeater_fields: [
      { key: 'name', label: { en: 'Item name', hi: 'आइटम का नाम' }, type: 'text', required: true },
      { key: 'price', label: { en: 'Price', hi: 'कीमत' }, type: 'number', required: true },
      { key: 'category', label: { en: 'Category', hi: 'श्रेणी' }, type: 'text', required: false },
      { key: 'description', label: { en: 'Description', hi: 'विवरण' }, type: 'text', required: false }
    ] } },
  { category: 'pure-veg-restaurant', order: 15,
    key: 'menu_items', type: 'repeater',
    label_en: 'Menu items', label_hi: 'मेन्यू आइटम',
    validation: { required: false, minItems: 1, repeater_fields: [
      { key: 'name', label: { en: 'Item name', hi: 'आइटम का नाम' }, type: 'text', required: true },
      { key: 'price', label: { en: 'Price', hi: 'कीमत' }, type: 'number', required: true },
      { key: 'category', label: { en: 'Category', hi: 'श्रेणी' }, type: 'text', required: false },
      { key: 'description', label: { en: 'Description', hi: 'विवरण' }, type: 'text', required: false }
    ] } },
  { category: 'retail-shop', order: 10,
    key: 'products', type: 'repeater',
    label_en: 'Products / catalogue', label_hi: 'उत्पाद / कैटलॉग',
    validation: { required: false, minItems: 1, repeater_fields: [
      { key: 'name', label: { en: 'Product name', hi: 'उत्पाद का नाम' }, type: 'text', required: true },
      { key: 'price', label: { en: 'Price', hi: 'कीमत' }, type: 'number', required: false },
      { key: 'unit', label: { en: 'Unit / size', hi: 'इकाई / आकार' }, type: 'text', required: false },
      { key: 'stock', label: { en: 'Availability', hi: 'उपलब्धता' }, type: 'select', required: false, options: ['in_stock', 'limited', 'out_of_stock'] },
      { key: 'image_url', label: { en: 'Image URL', hi: 'फोटो लिंक' }, type: 'url', required: false }
    ] } },

  // ---- Newly added categories ----
  { category: 'clothing-store', order: 10, key: 'brands', type: 'text', label_en: 'Brands available', label_hi: 'उपलब्ध ब्रांड', validation: { required: false } },
  { category: 'clothing-store', order: 11, key: 'clothing_types', type: 'multi_select', label_en: 'Clothing types', label_hi: 'कपड़ों के प्रकार', options: ['men', 'women', 'kids', 'ethnic', 'casual', 'sportswear'] },
  { category: 'clothing-store', order: 12, key: 'alteration_available', type: 'boolean', label_en: 'Alteration available', label_hi: 'अल्टरशन उपलब्ध' },
  { category: 'pharmacy', order: 10, key: 'pharmacy_services', type: 'multi_select', label_en: 'Pharmacy services', label_hi: 'फार्मेसी सेवाएँ', options: ['prescription_medicine', 'otc_medicine', 'home_delivery', 'lab_collection'] },
  { category: 'pharmacy', order: 11, key: 'open_24x7', type: 'boolean', label_en: 'Open 24×7', label_hi: '24×7 खुला' },
  { category: 'fitness-centre', order: 10, key: 'fitness_facilities', type: 'multi_select', label_en: 'Facilities', label_hi: 'सुविधाएँ', options: ['weights', 'cardio', 'personal_training', 'yoga', 'zumba', 'steam'] },
  { category: 'fitness-centre', order: 11, key: 'trial_available', type: 'boolean', label_en: 'Trial session available', label_hi: 'ट्रायल सेशन उपलब्ध' },
  { category: 'automobile-service', order: 10, key: 'auto_services', type: 'multi_select', label_en: 'Services offered', label_hi: 'दी जाने वाली सेवाएँ', options: ['general_repair', 'car_wash', 'puncture', 'battery', 'oil_change', 'towing'] },
  { category: 'automobile-service', order: 11, key: 'pickup_drop_available', type: 'boolean', label_en: 'Pickup & drop available', label_hi: 'पिकअप और ड्रॉप उपलब्ध' },
  { category: 'electronics-store', order: 10, key: 'electronics_categories', type: 'multi_select', label_en: 'Products sold', label_hi: 'बेचे जाने वाले उत्पाद', options: ['mobile', 'laptop', 'tv', 'audio', 'camera', 'accessories'] },
  { category: 'electronics-store', order: 11, key: 'warranty_support', type: 'boolean', label_en: 'Warranty support', label_hi: 'वारंटी सहायता' },
  { category: 'hotel-guest-house', order: 10, key: 'room_types', type: 'multi_select', label_en: 'Room types', label_hi: 'कमरों के प्रकार', options: ['single', 'double', 'deluxe', 'suite', 'family'] },
  { category: 'hotel-guest-house', order: 11, key: 'hotel_amenities', type: 'multi_select', label_en: 'Amenities', label_hi: 'सुविधाएँ', options: ['wifi', 'parking', 'restaurant', 'ac', 'room_service', 'breakfast'] },
  { category: 'hotel-guest-house', order: 12, key: 'room_count', type: 'number', label_en: 'Number of rooms', label_hi: 'कमरों की संख्या', validation: { min: 1 } },
  { category: 'hotel-guest-house', order: 13, key: 'check_in_time', type: 'text', label_en: 'Check-in time', label_hi: 'चेक-इन समय' },
  { category: 'hotel-guest-house', order: 14, key: 'check_out_time', type: 'text', label_en: 'Check-out time', label_hi: 'चेक-आउट समय' }
];

const CATEGORY_SLUG_TO_ID = {
  'restaurant': '11111111-0000-0000-0000-000000000002',
  'pure-veg-restaurant': '11111111-0000-0000-0000-000000000003',
  'doctor': '11111111-0000-0000-0000-000000000005',
  'salon': '11111111-0000-0000-0000-000000000007',
  'stone-crusher': '11111111-0000-0000-0000-000000000009',
  'retail-shop': '11111111-0000-0000-0000-000000000011',
  'grocery-store': '11111111-0000-0000-0000-000000000012',
  'plumber': '11111111-0000-0000-0000-000000000014',
  'clothing-store': '11111111-0000-0000-0000-000000000016',
  'pharmacy': '11111111-0000-0000-0000-000000000017',
  'fitness-centre': '11111111-0000-0000-0000-000000000019',
  'automobile-service': '11111111-0000-0000-0000-000000000020',
  'electronics-store': '11111111-0000-0000-0000-000000000021',
  'hotel-guest-house': '11111111-0000-0000-0000-000000000023'
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
