import { connectToDatabase } from './config/database';
import { Role } from './models/role.model';
import { User } from './models/user.model';

const seedDatabase = async () => {
  try {
    await connectToDatabase();

    // Create default roles
    const adminRole = await Role.findOneAndUpdate(
      { name: 'admin' },
      {
        name: 'admin',
        permissions: ['all'],
        description: 'Administrator with full access',
        isDefault: false
      },
      { upsert: true, new: true }
    );

    const employeeRole = await Role.findOneAndUpdate(
      { name: 'employee' },
      {
        name: 'employee',
        permissions: ['leave:apply', 'claim:submit', 'profile:view', 'attendance:clock'],
        description: 'Regular employee',
        isDefault: true
      },
      { upsert: true, new: true }
    );

    // Create admin user if not exists
    const adminEmail = 'admin@hrs.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: 'admin123', // In production, use a more secure password
        role: adminRole._id
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();