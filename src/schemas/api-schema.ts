import { z } from "zod";
import { provinces } from "../utils/province";

export const getFindEmpSchema = z.object({
  title: z.string().max(255, "Title must be less than 255 characters"),
  province: z.enum(provinces),
  jobLocation: z
    .string()
    .max(255, "Job location must be less than 255 characters"),
  salary: z.number().int(),
  workHoursRange: z
    .string()
    .max(255, "Work hours range must be less than 255 characters"),
});
