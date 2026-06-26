import { run, get, all } from '../database';
import { Child } from '../types';

export interface ChildWithTeacherName extends Child {
  assigned_teacher_name: string | null;
}

const CHILD_WITH_TEACHER_SELECT = `
  SELECT children.*, teacher.name AS assigned_teacher_name
  FROM children
  LEFT JOIN users AS teacher ON teacher.id = children.assigned_teacher_id
`;

export async function createChild(
  name: string,
  age: number,
  learningStyle: string | null,
  parentId: number
): Promise<ChildWithTeacherName> {
  const result = await run(
    'INSERT INTO children (name, age, learning_style, parent_id) VALUES (?, ?, ?, ?)',
    [name, age, learningStyle, parentId]
  );
  const child = await findChildById(result.lastID);
  if (!child) throw new Error('Failed to create child');
  return child;
}

export function findChildById(id: number): Promise<ChildWithTeacherName | undefined> {
  return get<ChildWithTeacherName>(`${CHILD_WITH_TEACHER_SELECT} WHERE children.id = ?`, [id]);
}

export function findChildrenByParentId(parentId: number): Promise<ChildWithTeacherName[]> {
  return all<ChildWithTeacherName>(`${CHILD_WITH_TEACHER_SELECT} WHERE children.parent_id = ?`, [parentId]);
}

export function findChildrenByTeacherId(teacherId: number): Promise<Child[]> {
  return all<Child>(
    `SELECT children.* FROM children
     JOIN teacher_children ON teacher_children.child_id = children.id
     WHERE teacher_children.teacher_id = ?`,
    [teacherId]
  );
}

export async function isTeacherAssignedToChild(teacherId: number, childId: number): Promise<boolean> {
  const row = await get(
    'SELECT 1 FROM teacher_children WHERE teacher_id = ? AND child_id = ?',
    [teacherId, childId]
  );
  return !!row;
}

export async function assignTeacherToChild(teacherId: number, childId: number): Promise<void> {
  await run(
    'INSERT OR IGNORE INTO teacher_children (teacher_id, child_id) VALUES (?, ?)',
    [teacherId, childId]
  );
}

export async function enrollChildInTier1(
  childId: number,
  teacherId: number,
  schoolClass: string,
  startDate: string
): Promise<ChildWithTeacherName | undefined> {
  await run(
    `UPDATE children
     SET enrollment_status = 'enrolled_tier1', tier1_start_date = ?, school_class = ?, assigned_teacher_id = ?
     WHERE id = ?`,
    [startDate, schoolClass, teacherId, childId]
  );
  await assignTeacherToChild(teacherId, childId);
  return findChildById(childId);
}

export async function updateChild(
  id: number,
  name: string,
  age: number,
  learningStyle: string | null,
  emergencyContact?: string | null
): Promise<ChildWithTeacherName | undefined> {
  if (emergencyContact !== undefined) {
    await run(
      'UPDATE children SET name = ?, age = ?, learning_style = ?, emergency_contact = ? WHERE id = ?',
      [name, age, learningStyle, emergencyContact, id]
    );
  } else {
    await run(
      'UPDATE children SET name = ?, age = ?, learning_style = ? WHERE id = ?',
      [name, age, learningStyle, id]
    );
  }
  return findChildById(id);
}
