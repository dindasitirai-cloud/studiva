import { run, get, all } from '../database';
import { User, PublicUser, UserRole } from '../types';

export function toPublicUser(user: User): PublicUser {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: UserRole,
  name: string
): Promise<User> {
  const result = await run(
    'INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)',
    [email, passwordHash, role, name]
  );
  const user = await get<User>('SELECT * FROM users WHERE id = ?', [result.lastID]);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export function findUserByEmail(email: string): Promise<User | undefined> {
  return get<User>('SELECT * FROM users WHERE email = ?', [email]);
}

export function findUserById(id: number): Promise<User | undefined> {
  return get<User>('SELECT * FROM users WHERE id = ?', [id]);
}

export async function updateUser(id: number, name: string): Promise<User | undefined> {
  await run('UPDATE users SET name = ? WHERE id = ?', [name, id]);
  return findUserById(id);
}

export function findTeachers(): Promise<User[]> {
  return all<User>('SELECT * FROM users WHERE role = ?', ['teacher']);
}

export function findAllUsers(): Promise<User[]> {
  return all<User>('SELECT * FROM users ORDER BY created_at DESC');
}

export function countAllUsers(): Promise<{ count: number } | undefined> {
  return get<{ count: number }>('SELECT COUNT(*) as count FROM users');
}
