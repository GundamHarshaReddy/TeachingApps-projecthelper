"use server"

import { v4 as uuidv4 } from 'uuid';

type SavedText = {
  id: string;
  text: string;
  createdAt: Date;
};

// In-memory storage for simplicity
const savedTexts = new Map<string, SavedText>();

export async function saveText(text: string): Promise<SavedText> {
  const id = uuidv4();
  const savedText = {
    id,
    text,
    createdAt: new Date(),
  };
  
  savedTexts.set(id, savedText);
  return savedText;
}

export async function getSavedText(id: string): Promise<SavedText | null> {
  return savedTexts.get(id) || null;
}

export async function getAllSavedTexts(): Promise<SavedText[]> {
  return Array.from(savedTexts.values()).sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function deleteSavedText(id: string): Promise<boolean> {
  return savedTexts.delete(id);
}
