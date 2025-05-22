import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { secret, expiresIn } from '../config/jwt.js';
import User from '../models/user.model.js';

export const register = async (req, res) => {
  const { email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: 'Username already exists' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, username: user.email },
    secret,
    { expiresIn }
  );

  const decoded = jwt.decode(token);
  console.log(decoded);

  res.json({ token });
};

export const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
