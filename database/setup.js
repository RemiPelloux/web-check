import { 
  initDatabase, 
  createUser, 
  setDisabledPlugins 
} from './db.js';

console.log('🚀 Starting APDP Checkit Database Setup...\n');

// Initialize database schema
initDatabase();

// Create default APDP admin user
console.log('📝 Creating default APDP admin user...');
const adminPassword = 'Admin@APDP2025!'; // Strong default password
try {
  const admin = createUser('admin@apdp.mc', adminPassword, 'APDP', '');
  console.log('✅ APDP admin user created successfully');
  console.log(`   Username: admin@apdp.mc`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role: APDP\n`);
} catch (error) {
  if (error.message.includes('UNIQUE')) {
    console.log('ℹ️  APDP admin user already exists\n');
  } else {
    console.error('❌ Error creating admin user:', error.message);
  }
}

// Create example DPD user (no password - IP-based authentication only)
console.log('📝 Creating example DPD user...');
try {
  const dpd = createUser('dpd@example.mc', 'temp-not-used', 'DPD', '');
  console.log('✅ Example DPD user created successfully');
  console.log(`   Username: dpd@example.mc`);
  console.log(`   Password: Not required (IP-based authentication)`);
  console.log(`   Role: DPD`);
  console.log(`   IP Restrictions: None (configure in admin panel)\n`);
} catch (error) {
  if (error.message.includes('UNIQUE')) {
    console.log('ℹ️  Example DPD user already exists\n');
  } else {
    console.error('❌ Error creating DPD user:', error.message);
  }
}

// Initialize disabled plugins list (empty by default)
console.log('📝 Initializing plugin configuration...');
setDisabledPlugins([]);
console.log('✅ Plugin configuration initialized (all plugins enabled by default)\n');

console.log('🎉 Database setup complete!\n');
console.log('=' .repeat(60));
console.log('IMPORTANT: Please change the APDP admin password immediately!');
console.log('DPD users do not require passwords - they use IP-based authentication.');
console.log('=' .repeat(60));
console.log('\nTo start the application, run:');
console.log('  npm start\n');

