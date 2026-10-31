'use strict';

// Staging/dev dataset: ~100 published businesses spread across every leaf
// category (11-12 each — 9 leaf categories cap out at 90 with 5-10 each, so
// the distribution is round-robin to hit the 100 total), each with its own
// demo owner user so /businesses/me flows also have data.
//
// NEVER runs in production: `up` is a no-op when NODE_ENV=production.
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');

const OWNER_EMAIL_DOMAIN = 'demo.haannaa.local';
const OWNER_PASSWORD = process.env.DEMO_PASSWORD || 'Demo@123';
const TOTAL_BUSINESSES = 100;

// Name fragments per leaf category slug — pairs combine into distinct names.
const NAME_POOLS = {
  'restaurant': ['Sagar Restaurant', 'Annapurna Bhojanalay', 'Tandoori Nights', 'City Kitchen', 'Royal Thali House'],
  'pure-veg-restaurant': ['Sharma Dhaba', 'Krishna Pure Veg', 'Bhojnalay Sagar', 'Jain Bhojanalay', 'Green Leaf Thali'],
  'doctor': ['Dr. Anita Verma Clinic', 'Dr. Rakesh Sharma Clinic', 'City Care Clinic', 'Dr. Mehta Health Point', 'Arogya Clinic'],
  'salon': ['Style Studio', 'Gents Point Salon', 'Glow Up Salon', 'New Look Unisex', 'Raja Salon'],
  'stone-crusher': ['Patidar Stone Crusher', 'Shri Balaji Crusher', 'Mahadev Crusher Unit', 'Sai Stone Works', 'Ganesh Crusher'],
  'building-material-supplier': ['Verma Building Mart', 'Shri Supplies Depot', 'Bharat Material Traders', 'Kisan Hardware & Bricks', 'Metro Cement House'],
  'grocery-store': ['Shree Kirana Store', 'Gupta General Store', 'Daily Needs Mart', 'Sai Provision Store', 'New Bharat Kirana'],
  'plumber': ['Sharma Plumbing Works', 'QuickFix Plumbing', 'Raj Plumber Service', 'Aqua Care Plumbing', 'Shri Ram Plumbing'],
  'electrician': ['Verma Electricals', 'Power Point Electrician', 'Sai Electric Works', 'Bright Line Electrical', 'Maa Bhawani Electrical']
};

const CITIES = [
  { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  { city: 'Ujjain', state: 'Madhya Pradesh', pincode: '456001' },
  { city: 'Dewas', state: 'Madhya Pradesh', pincode: '455001' },
  { city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' }
];

const slugify = (value) =>
  String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (process.env.NODE_ENV === 'production') {
      // Never seed demo data into production.
      return;
    }

    // Leaf categories drive the distribution
    const leafCategories = await queryInterface.sequelize.query(
      'SELECT id, slug FROM categories WHERE is_leaf = true AND is_active = true ORDER BY display_order ASC, name_en ASC',
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (leafCategories.length === 0) {
      // Category tree not seeded yet; skip gracefully rather than fail the seed run.
      return;
    }

    const hashingRounds = parseInt(process.env.HASHING_ROUNDS || '10', 10);
    // One hash shared by every demo owner — they all use the same demo password
    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, hashingRounds);
    const now = new Date();

    const users = [];
    const businesses = [];
    const usedSlugs = new Set();
    const slugFor = (name) => {
      let candidate = slugify(name);
      let suffix = 2;
      while (usedSlugs.has(candidate)) {
        candidate = `${slugify(name)}-${suffix++}`;
      }
      usedSlugs.add(candidate);
      return candidate;
    };

    for (let i = 0; i < TOTAL_BUSINESSES; i += 1) {
      const category = leafCategories[i % leafCategories.length];
      const pool = NAME_POOLS[category.slug] || ['Demo Business'];
      const baseName = pool[Math.floor(i / leafCategories.length) % pool.length];
      const name = `${baseName} ${String(i + 1).padStart(3, '0')}`;
      const city = CITIES[i % CITIES.length];
      const userId = randomUUID();

      // A handful of non-published rows so admin review queue has data too;
      // the public API only serves `published`.
      const status = i % 12 === 5 ? 'pending_review' : (i % 25 === 7 ? 'draft' : 'published');

      users.push({
        id: userId,
        name: `Demo Owner ${String(i + 1).padStart(3, '0')}`,
        email: `owner${String(i + 1).padStart(3, '0')}@${OWNER_EMAIL_DOMAIN}`,
        password: passwordHash,
        is_active: true,
        created_at: now,
        updated_at: now
      });

      businesses.push({
        id: randomUUID(),
        name,
        slug: slugFor(name),
        owner_user_id: userId,
        primary_category_id: category.id,
        description: `${baseName} — demo ${category.slug.replace(/-/g, ' ')} business in ${city.city} (seeded for staging).`,
        phone: `+9198${String(10000000 + i * 137).slice(0, 8)}`.slice(0, 13),
        whatsapp: null,
        website_url: null,
        address: JSON.stringify({ line1: `Shop ${i + 1}, Main Road`, city: city.city, state: city.state, pincode: city.pincode }),
        service_area: null,
        hours: JSON.stringify({ mon_sat: ['09:00-20:00'], sun: ['closed'] }),
        opening_date: null,
        status,
        verification_status: status === 'published' ? 'verified' : 'unverified',
        completeness_score: 55 + (i % 45),
        form_version: 1,
        attributes: JSON.stringify({}),
        rejection_reason: null,
        created_at: now,
        updated_at: now
      });
    }

    await queryInterface.bulkInsert('users', users, {});
    await queryInterface.bulkInsert('businesses', businesses, {});
  },

  down: async (queryInterface) => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    await queryInterface.sequelize.query(
      `DELETE FROM businesses WHERE owner_user_id IN (SELECT id FROM users WHERE email LIKE :pattern)`,
      { replacements: { pattern: `%@${OWNER_EMAIL_DOMAIN}` } }
    );
    await queryInterface.bulkDelete('users', {
      email: { [require('sequelize').Op.like]: `%@${OWNER_EMAIL_DOMAIN}` }
    }, {});
  }
};
