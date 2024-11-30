import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

// Tables

export const testTable = pgTable("test", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

// Relations

export const testRelation = relations(testTable, ({ one, many }) => {
  return {};
});
