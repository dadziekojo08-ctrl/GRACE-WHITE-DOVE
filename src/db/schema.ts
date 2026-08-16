import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
