// Zod schemas for Claude Agent Skill validation
import { z } from "zod";

const NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const XML_TAG_REGEX = /<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/;
const RESERVED_WORDS = ["anthropic", "claude", "system", "admin", "root", "default", "internal"];

export const skillNameSchema = z
  .string()
  .min(1, "Skill name is required")
  .max(64, "Skill name must be 64 characters or less")
  .regex(NAME_REGEX, "Only lowercase letters, numbers, and hyphens allowed")
  .refine(
    (name) => !RESERVED_WORDS.some((w) => name.includes(w)),
    "Name contains a reserved word (anthropic, claude, system, etc.)"
  )
  .refine(
    (name) => !XML_TAG_REGEX.test(name),
    "Name must not contain XML tags"
  );

export const skillDescriptionSchema = z
  .string()
  .min(1, "Description is required")
  .max(1024, "Description must be 1024 characters or less")
  .refine(
    (desc) => !XML_TAG_REGEX.test(desc),
    "Description must not contain XML tags"
  )
  .refine(
    (desc) => {
      const firstWord = desc.trim().split(/\s+/)[0]?.toLowerCase();
      return !["i", "you", "we", "my", "your", "our"].includes(firstWord || "");
    },
    "Description should be written in third person"
  );

export const skillFrontmatterSchema = z.object({
  name: skillNameSchema,
  description: skillDescriptionSchema,
});

export const skillConfigSchema = z.object({
  name: skillNameSchema,
  description: skillDescriptionSchema,
  type: z.enum(["reference", "task", "hybrid"]).default("hybrid"),
  freedomLevel: z.enum(["high", "medium", "low"]).default("medium"),
  includeReference: z.boolean().default(false),
  includeExamples: z.boolean().default(false),
  includeScripts: z.boolean().default(false),
  sections: z.array(z.string()).optional(),
  customInstructions: z.string().optional(),
});

export type SkillConfig = z.infer<typeof skillConfigSchema>;
export type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>;
