import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Notification from '../models/notification';

const router: Router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all fields' });
      return;
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Account with this email already exists' });
      return;
    }
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: password
    });
    await newUser.save();
    try {
      await Notification.create({
        userId: newUser._id,
        cohort: "System", 
        type: "achievement", 
        title: "Welcome to PeerLearning!",
        message: `Hi ${name.split(' ')[0]}, we are thrilled to have you here. Start by exploring the Dashboard or joining a Cohort.`
      });
    } catch (notifError) {
      console.error("Failed to generate welcome notification:", notifError);
    }
    const userObject = newUser.toObject();
    delete userObject.password;

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    res.status(201).json({ success: true, data: { ...userObject, token } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: "${email}", Password: "${password}"`);
    if (!email || !password) {
      console.log(`[LOGIN FAILED] Missing email or password`);
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: "${email.toLowerCase()}"`);
      res.status(404).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    console.log(`[LOGIN USER FOUND] Hashed Password in DB: "${user.password}"`);
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      console.log(`[LOGIN FAILED] Password mismatch for email: "${email}"`);
      res.status(400).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    console.log(`[LOGIN SUCCESS] Email: "${email}"`);
    const userObject = user.toObject();
    delete userObject.password;
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    
    try {
      await Notification.create({
        userId: user._id,
        cohort: "System", 
        type: "achievement", 
        title: "Security Alert: New Login",
        message: `Welcome back, ${user.name}! A new login was detected on your account.`
      });
    } catch (notifError) {
      console.error("Failed to generate login notification:", notifError);
    }
    res.json({ success: true, data: { ...userObject, token } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.password) delete req.body.password;
    if (req.body.email) delete req.body.email; 
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    ).select('-password');
    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password as string);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;