'use strict';

// A few demo businesses (one per major category) so the public profile page
// and admin queue have data from the first boot. Owners are the demo users
// seeded by 20260912000001-demo-users.cjs.
const { randomUUID } = require('crypto');

const DEMO_BUSINESSES = [
  {
    name: 'Sharma Dhaba', slug: 'sharma-dhaba',
    ownerEmail: 'staff@crusher.com', // demo user seeded by 20260912000001-demo-users
    category: '11111111-0000-0000-0000-000000000003', // pure-veg-restaurant
    description: 'Family-run pure veg dhaba serving home-style thalis since 1998.',
    phone: '+919876543210',
    attributes: { cuisines: ['north_indian'], price_range: '₹', is_pure_veg: true, seating_capacity: 40, payment_modes: ['cash', 'upi'] },
    completeness: 85
  },
  {
    name: 'Dr. Anita Verma Clinic', slug: 'dr-anita-verma-clinic',
    ownerEmail: 'staff@crusher.com',
    category: '11111111-0000-0000-0000-000000000005', // doctor
    description: 'General physician and pediatrician. Walk-in and by-appointment.',
    phone: '+919812345678',
    attributes: { specialization: ['general_physician', 'pediatrician'], registration_no: 'MP-45231', payment_modes: ['cash', 'upi'] },
    completeness: 75
  },
  {
    name: 'Patidar Stone Crusher', slug: 'patidar-stone-crusher',
    ownerEmail: 'staff@crusher.com',
    category: '11111111-0000-0000-0000-000000000009', // stone-crusher
    description: 'Stone crusher and building material supplier serving nearby villages.',
    phone: '+919812345670',
    attributes: { materials: ['ret', 'gitti'], capacity_tph: 150, transport_available: true, payment_modes: ['cash', 'bank_transfer'] },
    completeness: 65,
    status: 'pending_review'
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [owner] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email: DEMO_BUSINESSES[0].ownerEmail }, type: Sequelize.QueryTypes.SELECT }
    );
    if (!owner) {
      // Demo users not seeded yet; skip gracefully rather than fail the seed run.
      return;
    }

    const now = new Date();
    const rows = DEMO_BUSINESSES.map((b) => ({
      id: randomUUID(),
      name: b.name,
      slug: b.slug,
      owner_user_id: owner.id,
      primary_category_id: b.category,
      description: b.description,
      phone: b.phone,
      whatsapp: b.phone,
      website_url: null,
      // JSONB columns passed as strings: bulkInsert lacks model type info
      address: JSON.stringify({ line1: 'Main Road', city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' }),
      service_area: null,
      hours: JSON.stringify({ mon_sat: ['09:00-20:00'], sun: ['closed'] }),
      opening_date: null,
      status: b.status || 'published',
      verification_status: 'verified',
      completeness_score: b.completeness,
      form_version: 1,
      attributes: JSON.stringify(b.attributes),
      rejection_reason: null,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('businesses', rows, {});
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('businesses', {
      slug: DEMO_BUSINESSES.map((b) => b.slug)
    }, {});
  }
};
