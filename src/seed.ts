// src/seed.ts
import { connectToDatabase } from './config/database';
import { User } from './models/user.model';
import { UserType } from './interfaces/user.interface';

const seedDatabase = async () => {
  try {
    await connectToDatabase();

    // Create admin user if not exists
    const adminEmail = 'admin@hrs.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: 'admin123',
        userType: UserType.ADMIN
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