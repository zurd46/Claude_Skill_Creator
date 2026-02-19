// File system utilities
import fse from "fs-extra";
import * as nodeFs from "node:fs/promises";
import * as path from "path";

export const PROJECTS_DIR = "projekte";

export function getProjectPath(projectName: string): string {
  return path.join(process.cwd(), PROJECTS_DIR, projectName);
}

export function getSkillsPath(projectName: string): string {
  return path.join(getProjectPath(projectName), "skills");
}

export function getSkillPath(projectName: string, skillName: string): string {
  return path.join(getSkillsPath(projectName), skillName);
}

export async function ensureProjectExists(projectName: string): Promise<void> {
  const projectPath = getProjectPath(projectName);
  await fse.ensureDir(path.join(projectPath, "skills"));
}

export async function listProjects(): Promise<string[]> {
  const projectsDir = path.join(process.cwd(), PROJECTS_DIR);
  if (!(await fse.pathExists(projectsDir))) return [];
  const entries = await nodeFs.readdir(projectsDir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function listSkills(projectName: string): Promise<string[]> {
  const skillsPath = getSkillsPath(projectName);
  if (!(await fse.pathExists(skillsPath))) return [];
  const entries = await nodeFs.readdir(skillsPath, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function skillExists(
  projectName: string,
  skillName: string
): Promise<boolean> {
  const skillPath = getSkillPath(projectName, skillName);
  return fse.pathExists(skillPath);
}

export async function writeSkillFile(
  projectName: string,
  skillName: string,
  fileName: string,
  content: string
): Promise<string> {
  const filePath = path.join(getSkillPath(projectName, skillName), fileName);
  await fse.ensureDir(path.dirname(filePath));
  await fse.writeFile(filePath, content, "utf-8");
  return filePath;
}

export async function readSkillFile(filePath: string): Promise<string> {
  return fse.readFile(filePath, "utf-8");
}

export async function pathExists(p: string): Promise<boolean> {
  return fse.pathExists(p);
}
