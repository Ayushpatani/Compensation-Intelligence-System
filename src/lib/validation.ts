import { z } from 'zod';

export const SalaryEntrySchema = z.object({
  company: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Job title is required"),
  level: z.string().min(1, "Level is required"),
  base: z.coerce.number().nonnegative("Base salary must be non-negative"),
  stock: z.coerce.number().nonnegative("Stock equity must be non-negative").default(0),
  bonus: z.coerce.number().nonnegative("Bonus must be non-negative").default(0),
  location: z.string().min(1, "Location is required"),
  yearsOfExperience: z.coerce.number().nonnegative("Years of experience must be non-negative"),
  yearsAtCompany: z.coerce.number().nonnegative("Years at company must be non-negative").optional().nullable(),
});

export type SalaryEntryInput = z.infer<typeof SalaryEntrySchema>;
