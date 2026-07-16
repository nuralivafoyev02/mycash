import { Request, Response } from 'express';
import { supabase } from '../config/db';
import bcrypt from 'bcryptjs';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check if user exists in the database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid credentials. User not found.' });
      }

      // Verify the password
      if (!user.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials. Account is missing a password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
      }

      // Remove password_hash before sending the user object
      delete user.password_hash;
      user.name = user.full_name;
      delete user.full_name;

      // Generate a mock JWT token for this demo
      const mockToken = Buffer.from(`mock_jwt_${user.id}_${Date.now()}`).toString('base64');

      res.status(200).json({
        message: 'Login successful',
        token: mockToken,
        user: user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
