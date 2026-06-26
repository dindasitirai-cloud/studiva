import { run, get, all } from '../database';
import { Resource, ResourceCategory, ResourceFormat } from '../types';

export function findAllResources(category?: ResourceCategory): Promise<Resource[]> {
  if (category) {
    return all<Resource>(
      'SELECT * FROM resources WHERE category = ? ORDER BY published_date DESC',
      [category]
    );
  }
  return all<Resource>('SELECT * FROM resources ORDER BY published_date DESC');
}

export function findResourceById(id: number): Promise<Resource | undefined> {
  return get<Resource>('SELECT * FROM resources WHERE id = ?', [id]);
}

export async function createResource(
  title: string,
  description: string,
  content: string,
  category: ResourceCategory,
  format: ResourceFormat,
  author: string,
  publishedDate: string
): Promise<Resource> {
  const result = await run(
    'INSERT INTO resources (title, description, content, category, format, author, published_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, content, category, format, author, publishedDate]
  );
  const resource = await get<Resource>('SELECT * FROM resources WHERE id = ?', [result.lastID]);
  if (!resource) throw new Error('Failed to create resource');
  return resource;
}
