const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const AuditLog = require('../models/AuditLog');
const Location = require('../models/Location');
const mongoose = require('mongoose');

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, confirmPassword, location } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const userLocation = location
      ? await Location.findOne(
        mongoose.isValidObjectId(location)
          ? { _id: location }
          : { area: { $regex: `^${location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
      )
      : null;
    if (location && !userLocation) {
      return res.status(400).json({ message: 'Selected location was not found. Refresh the location list and try again.' });
    }

    const user = new User({
      fullName,
      email: normalizedEmail,
      phone,
      password,
      location: userLocation?._id,
      role: 'CITIZEN',
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      user: user._id,
      action: 'REGISTER',
      entity: 'User',
      entityId: user._id,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: userLocation?.area,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password').populate('location');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location?.area,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate('location');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phone, location } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (typeof fullName !== 'string' || !fullName.trim()
      || !normalizedEmail
      || typeof phone !== 'string' || !phone.trim()
      || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ message: 'Name, email, phone, and location are required.' });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.userId },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'That email address is already in use.' });
    }

    const userLocation = await Location.findOne(
      mongoose.isValidObjectId(location)
        ? { _id: location }
        : { area: { $regex: `^${location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
    );
    if (!userLocation) {
      return res.status(400).json({ message: 'Selected location was not found. Refresh the location list and try again.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.fullName = fullName.trim();
    user.email = normalizedEmail;
    user.phone = phone.trim();
    user.location = userLocation._id;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'UPDATE_PROFILE',
      entity: 'User',
      entityId: user._id,
    });

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: userLocation.area,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await AuditLog.create({
      user: req.user.userId,
      action: 'LOGOUT',
      entity: 'User',
      entityId: req.user.userId,
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};
