const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');
const User = require('./models/User');
const Disease = require('./models/Disease');
const Location = require('./models/Location');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Create locations
    const locationData = [
      {
        area: 'Anna Nagar',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
      },
      {
        area: 'Velachery',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
      },
      {
        area: 'Adyar',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
      },
      {
        area: 'T. Nagar',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
      },
      {
        area: 'Tambaram',
        city: 'Chennai',
        district: 'Chengalpattu',
        state: 'Tamil Nadu',
      },
    ];
    const locations = await Promise.all(locationData.map((location) =>
      Location.findOneAndUpdate(
        { area: location.area },
        { $setOnInsert: location },
        { upsert: true, new: true }
      )
    ));

    // Create diseases
    const diseaseData = [
      {
        diseaseName: 'Dengue',
        description: 'Dengue fever is a tropical disease caused by the dengue virus.',
        category: 'VIRAL',
        symptoms: ['High fever', 'Headache', 'Muscle pain', 'Rash'],
        prevention: ['Use mosquito repellent', 'Wear full sleeves', 'Remove stagnant water'],
        severityLevel: 'HIGH',
      },
      {
        diseaseName: 'Malaria',
        description: 'Malaria is a parasitic infection spread by mosquitoes.',
        category: 'PARASITIC',
        symptoms: ['Fever', 'Chills', 'Sweating', 'Headache'],
        prevention: ['Sleep under mosquito nets', 'Use insecticides', 'Avoid mosquito bites'],
        severityLevel: 'HIGH',
      },
      {
        diseaseName: 'Typhoid',
        description: 'Typhoid fever is caused by Salmonella typhi bacteria.',
        category: 'BACTERIAL',
        symptoms: ['Prolonged fever', 'Weakness', 'Abdominal pain', 'Rash'],
        prevention: ['Drink clean water', 'Practice hygiene', 'Get vaccinated'],
        severityLevel: 'MEDIUM',
      },
      {
        diseaseName: 'Influenza',
        description: 'Flu is a viral infection affecting the respiratory system.',
        category: 'VIRAL',
        symptoms: ['Cough', 'Sore throat', 'Fever', 'Fatigue'],
        prevention: ['Get vaccinated', 'Practice hand hygiene', 'Avoid crowded places'],
        severityLevel: 'MEDIUM',
      },
      {
        diseaseName: 'COVID-19',
        description: 'COVID-19 is caused by the SARS-CoV-2 virus.',
        category: 'VIRAL',
        symptoms: ['Cough', 'Fever', 'Loss of taste', 'Shortness of breath'],
        prevention: ['Wear masks', 'Social distancing', 'Get vaccinated'],
        severityLevel: 'CRITICAL',
      },
    ];
    await Promise.all(diseaseData.map((disease) =>
      Disease.findOneAndUpdate(
        { diseaseName: disease.diseaseName },
        { $setOnInsert: disease },
        { upsert: true, new: true }
      )
    ));

    // Create users
    const users = [
      {
        fullName: 'Admin User',
        email: 'admin@example.com',
        phone: '9000000001',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        location: locations[0]._id,
      },
      {
        fullName: 'Health Official',
        email: 'official@example.com',
        phone: '9000000002',
        password: await bcrypt.hash('official123', 10),
        role: 'HEALTH_OFFICIAL',
        location: locations[0]._id,
      },
      {
        fullName: 'Healthcare Worker',
        email: 'worker@example.com',
        phone: '9000000003',
        password: await bcrypt.hash('worker123', 10),
        role: 'HEALTHCARE_WORKER',
        location: locations[0]._id,
      },
      {
        fullName: 'John Citizen',
        email: 'citizen@example.com',
        phone: '9000000004',
        password: await bcrypt.hash('citizen123', 10),
        role: 'CITIZEN',
        location: locations[1]._id,
      },
      {
        fullName: 'Jane Citizen',
        email: 'jane@example.com',
        phone: '9000000005',
        password: await bcrypt.hash('jane123', 10),
        role: 'CITIZEN',
        location: locations[2]._id,
      },
    ];
    await Promise.all(users.map((user) =>
      User.updateOne(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true }
      )
    ));

    console.log('✓ Database seeded successfully!');
    console.log('');
    console.log('Default Users:');
    console.log('- Admin: admin@example.com / admin123');
    console.log('- Health Official: official@example.com / official123');
    console.log('- Healthcare Worker: worker@example.com / worker123');
    console.log('- Citizen 1: citizen@example.com / citizen123');
    console.log('- Citizen 2: jane@example.com / jane123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
