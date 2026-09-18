import fs from "fs/promises";
import path from "path";
import { BlogPostItem, EventItem } from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data.replace(/^\uFEFF/, "")) as T;
}

export async function writeJsonFile<T>(filename: string, content: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  const jsonString = JSON.stringify(content, null, 2);
  await fs.writeFile(filePath, jsonString, "utf-8");
}
