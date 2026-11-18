'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const randomUUID = require('crypto').randomUUID;
    const roots = [
      { id: randomUUID(), name_en: 'Gym & Fitness', name_hi: 'जिम एवं फिटनेस', slug: 'gym-fitness', parent_id: null, display_order: 7, is_leaf: false },
      { id: randomUUID(), name_en: 'Hotel', name_hi: 'होटल', slug: 'hotel', parent_id: null, display_order: 8, is_leaf: false }
    ];

    for (const root of roots) {
      const found = await queryInterface.sequelize.query('SELECT id FROM categories WHERE slug = :slug LIMIT 1', { replacements: { slug: root.slug }, type: Sequelize.QueryTypes.SELECT });
      if (found.length === 0) await queryInterface.bulkInsert('categories', [{ ...root, is_active: true, created_at: now, updated_at: now }]);
    }

    const categorySlugs = ['restaurant', 'pure-veg-restaurant', 'doctor', 'salon', 'retail-shop', 'home-services', 'gym-fitness', 'hotel', 'clothing-store', 'pharmacy', 'fitness-centre', 'automobile-service', 'electronics-store', 'hotel-guest-house'];
    const categories = await queryInterface.sequelize.query('SELECT id, slug FROM categories WHERE slug IN (:slugs)', { replacements: { slugs: categorySlugs }, type: Sequelize.QueryTypes.SELECT });
    const idBySlug = Object.fromEntries(categories.map((item) => [item.slug, item.id]));

    const ensureLeaf = async (id, name_en, name_hi, slug, parentSlug, order) => {
      if (idBySlug[slug]) {
        const parentId = idBySlug[parentSlug] || null;
        if (parentId) await queryInterface.sequelize.query('UPDATE categories SET parent_id = :parentId, is_leaf = true, is_active = true, updated_at = :now WHERE id = :id', { replacements: { parentId, now, id: idBySlug[slug] } });
        return;
      }
      const parentId = idBySlug[parentSlug] || null;
      const row = { id: randomUUID(), name_en, name_hi, slug, parent_id: parentId, display_order: order, is_active: true, is_leaf: true, created_at: now, updated_at: now };
      await queryInterface.bulkInsert('categories', [row]);
      idBySlug[slug] = row.id;
    };

    await ensureLeaf(idBySlug['clothing-store'], 'Clothing Store', 'कपड़ों की दुकान', 'clothing-store', 'retail-shop', 2);
    await ensureLeaf(idBySlug['pharmacy'], 'Pharmacy', 'फार्मेसी', 'pharmacy', 'retail-shop', 3);
    await ensureLeaf(idBySlug['fitness-centre'], 'Fitness Centre', 'फिटनेस सेंटर', 'fitness-centre', 'gym-fitness', 1);
    await ensureLeaf(idBySlug['automobile-service'], 'Automobile Service', 'ऑटोमोबाइल सेवा', 'automobile-service', 'home-services', 3);
    await ensureLeaf(idBySlug['electronics-store'], 'Electronics Store', 'इलेक्ट्रॉनिक्स दुकान', 'electronics-store', 'retail-shop', 4);
    await ensureLeaf(idBySlug['hotel-guest-house'], 'Hotel / Guest House', 'होटल / गेस्ट हाउस', 'hotel-guest-house', 'hotel', 1);

    const fields = [
      { slug: 'restaurant', key: 'menu_items', type: 'repeater', label_en: 'Menu items', label_hi: 'मेन्यू आइटम', validation: { required: false, minItems: 1, repeater_fields: [
        { key: 'name', label: { en: 'Item name', hi: 'आइटम का नाम' }, type: 'text', required: true },
        { key: 'price', label: { en: 'Price', hi: 'कीमत' }, type: 'number', required: true },
        { key: 'category', label: { en: 'Category', hi: 'श्रेणी' }, type: 'text', required: false },
        { key: 'description', label: { en: 'Description', hi: 'विवरण' }, type: 'text', required: false }
      ] } },
      { slug: 'pure-veg-restaurant', key: 'menu_items', type: 'repeater', label_en: 'Menu items', label_hi: 'मेन्यू आइटम', validation: { required: false, minItems: 1, repeater_fields: [
        { key: 'name', label: { en: 'Item name', hi: 'आइटम का नाम' }, type: 'text', required: true },
        { key: 'price', label: { en: 'Price', hi: 'कीमत' }, type: 'number', required: true },
        { key: 'category', label: { en: 'Category', hi: 'श्रेणी' }, type: 'text', required: false },
        { key: 'description', label: { en: 'Description', hi: 'विवरण' }, type: 'text', required: false }
      ] } },
      { slug: 'doctor', key: 'consultation_timings', type: 'repeater', label_en: 'Consultation timings', label_hi: 'सलाह के समय', validation: { required: false, repeater_fields: [
        { key: 'day', label: { en: 'Day', hi: 'दिन' }, type: 'select', required: true, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        { key: 'opens', label: { en: 'Opens', hi: 'खुलने का समय' }, type: 'text', required: true },
        { key: 'closes', label: { en: 'Closes', hi: 'बंद होने का समय' }, type: 'text', required: true }
      ] } },
      { slug: 'doctor', key: 'consultation_fee', type: 'number', label_en: 'Consultation fee', label_hi: 'परामर्श शुल्क', validation: { min: 0 } },
      { slug: 'salon', key: 'service_menu', type: 'repeater', label_en: 'Service menu', label_hi: 'सेवा सूची', validation: { required: false, repeater_fields: [
        { key: 'name', label: { en: 'Service', hi: 'सेवा' }, type: 'text', required: true },
        { key: 'price', label: { en: 'Starting price', hi: 'शुरुआती कीमत' }, type: 'number', required: false },
        { key: 'duration', label: { en: 'Duration', hi: 'अवधि' }, type: 'text', required: false }
      ] } },
      { slug: 'retail-shop', key: 'products', type: 'repeater', label_en: 'Products / catalogue', label_hi: 'उत्पाद / कैटलॉग', validation: { required: false, minItems: 1, repeater_fields: [
        { key: 'name', label: { en: 'Product name', hi: 'उत्पाद का नाम' }, type: 'text', required: true },
        { key: 'price', label: { en: 'Price', hi: 'कीमत' }, type: 'number', required: false },
        { key: 'unit', label: { en: 'Unit / size', hi: 'इकाई / आकार' }, type: 'text', required: false },
        { key: 'stock', label: { en: 'Availability', hi: 'उपलब्धता' }, type: 'select', required: false, options: ['in_stock', 'limited', 'out_of_stock'] }
      ] } },
      { slug: 'clothing-store', key: 'brands', type: 'text', label_en: 'Brands available', label_hi: 'उपलब्ध ब्रांड', validation: { required: false } },
      { slug: 'clothing-store', key: 'clothing_types', type: 'multi_select', label_en: 'Clothing types', label_hi: 'कपड़ों के प्रकार', options: ['men', 'women', 'kids', 'ethnic', 'casual', 'sportswear'] },
      { slug: 'pharmacy', key: 'pharmacy_services', type: 'multi_select', label_en: 'Pharmacy services', label_hi: 'फार्मेसी सेवाएँ', options: ['prescription_medicine', 'otc_medicine', 'home_delivery', 'lab_collection'] },
      { slug: 'pharmacy', key: 'open_24x7', type: 'boolean', label_en: 'Open 24×7', label_hi: '24×7 खुला' },
      { slug: 'fitness-centre', key: 'fitness_facilities', type: 'multi_select', label_en: 'Facilities', label_hi: 'सुविधाएँ', options: ['weights', 'cardio', 'personal_training', 'yoga', 'zumba', 'steam'] },
      { slug: 'fitness-centre', key: 'trial_available', type: 'boolean', label_en: 'Trial session available', label_hi: 'ट्रायल सेशन उपलब्ध' },
      { slug: 'automobile-service', key: 'auto_services', type: 'multi_select', label_en: 'Services offered', label_hi: 'दी जाने वाली सेवाएँ', options: ['general_repair', 'car_wash', 'puncture', 'battery', 'oil_change', 'towing'] },
      { slug: 'automobile-service', key: 'pickup_drop_available', type: 'boolean', label_en: 'Pickup & drop available', label_hi: 'पिकअप और ड्रॉप उपलब्ध' },
      { slug: 'electronics-store', key: 'electronics_categories', type: 'multi_select', label_en: 'Products sold', label_hi: 'बेचे जाने वाले उत्पाद', options: ['mobile', 'laptop', 'tv', 'audio', 'camera', 'accessories'] },
      { slug: 'electronics-store', key: 'warranty_support', type: 'boolean', label_en: 'Warranty support', label_hi: 'वारंटी सहायता' },
      { slug: 'hotel-guest-house', key: 'room_types', type: 'multi_select', label_en: 'Room types', label_hi: 'कमरों के प्रकार', options: ['single', 'double', 'deluxe', 'suite', 'family'] },
      { slug: 'hotel-guest-house', key: 'hotel_amenities', type: 'multi_select', label_en: 'Amenities', label_hi: 'सुविधाएँ', options: ['wifi', 'parking', 'restaurant', 'ac', 'room_service', 'breakfast'] },
      { slug: 'hotel-guest-house', key: 'room_count', type: 'number', label_en: 'Number of rooms', label_hi: 'कमरों की संख्या', validation: { min: 1 } },
      { slug: 'hotel-guest-house', key: 'check_in_time', type: 'text', label_en: 'Check-in time', label_hi: 'चेक-इन समय' },
      { slug: 'hotel-guest-house', key: 'check_out_time', type: 'text', label_en: 'Check-out time', label_hi: 'चेक-आउट समय' }
    ];

    for (let index = 0; index < fields.length; index += 1) {
      const field = fields[index];
      const categoryId = idBySlug[field.slug];
      if (!categoryId) continue;
      const found = await queryInterface.sequelize.query('SELECT id FROM field_definitions WHERE category_id = :categoryId AND key = :key LIMIT 1', { replacements: { categoryId, key: field.key }, type: Sequelize.QueryTypes.SELECT });
      if (found.length > 0) continue;
      await queryInterface.bulkInsert('field_definitions', [{
        id: randomUUID(), category_id: categoryId, key: field.key, label_en: field.label_en, label_hi: field.label_hi,
        type: field.type, options: field.options ? JSON.stringify({ options: field.options }) : null,
        validation: JSON.stringify(field.validation || { required: false }), help_text_en: null, help_text_hi: null,
        display_order: index + 10, show_on_profile: true, visible_if: null, is_active: true, created_at: now, updated_at: now
      }]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('field_definitions', { key: ['products', 'brands', 'clothing_types', 'pharmacy_services', 'open_24x7', 'fitness_facilities', 'trial_available', 'auto_services', 'pickup_drop_available', 'electronics_categories', 'warranty_support', 'room_types', 'hotel_amenities', 'room_count', 'check_in_time', 'check_out_time'] });
    await queryInterface.bulkDelete('categories', { slug: ['clothing-store', 'pharmacy', 'fitness-centre', 'gym-fitness', 'automobile-service', 'electronics-store', 'hotel', 'hotel-guest-house'] });
  }
};
