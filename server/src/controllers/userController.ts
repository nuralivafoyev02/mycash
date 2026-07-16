import { Request, Response } from 'express';
import { UserRepository } from '../repositories/userRepository';
import bcrypt from 'bcryptjs';

const userRepository = new UserRepository();

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.findAll();
      // Ensure we don't send password hashes to the client
      const safeUsers = users.map(u => {
        const { password_hash, full_name, ...safeUser } = u;
        return { ...safeUser, name: full_name };
      });
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await userRepository.findById(id);
      if (user) {
        delete user.password_hash;
        user.name = user.full_name;
        delete user.full_name;
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      
      // Hash password if provided
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(userData.password, salt);
        delete userData.password;
      }

      // Map frontend 'name' to DB 'full_name'
      if (userData.name) {
        userData.full_name = userData.name;
        delete userData.name;
      }
      
      // auth_id is required in the DB schema, so we generate a mock one for our custom auth
      const crypto = require('crypto');
      userData.auth_id = crypto.randomUUID();

      const newUser = await userRepository.create(userData);
      
      if (newUser) {
        delete newUser.password_hash;
        newUser.name = newUser.full_name;
        delete newUser.full_name;
      }
      
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userData = req.body;
      
      // Hash password if provided and changing
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(userData.password, salt);
        delete userData.password;
      }

      // Map frontend 'name' to DB 'full_name'
      if (userData.name) {
        userData.full_name = userData.name;
        delete userData.name;
      }

      const updatedUser = await userRepository.update(id, userData);
      
      if (updatedUser) {
        delete updatedUser.password_hash;
        updatedUser.name = updatedUser.full_name;
        delete updatedUser.full_name;
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await userRepository.delete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
