import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isVip: boolean("is_vip").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isVip: true,
});

// Track model
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration").notNull(),
  playCount: integer("play_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrackSchema = createInsertSchema(tracks).pick({
  title: true,
  artist: true,
  thumbnailUrl: true,
  audioUrl: true,
  duration: true,
});

// Playlist model
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  coverUrl: text("cover_url"),
  trackCount: integer("track_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlaylistSchema = createInsertSchema(playlists).pick({
  name: true,
  userId: true,
  coverUrl: true,
});

// PlaylistTrack join table
export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  trackId: integer("track_id").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlaylistTrackSchema = createInsertSchema(playlistTracks).pick({
  playlistId: true,
  trackId: true,
  position: true,
});

// Favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackId: integer("track_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  trackId: true,
});

// Devices for Bluetooth
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'phone', 'headphones', etc
  userId: integer("user_id").notNull(),
  isPlaying: boolean("is_playing").default(false),
  lastConnected: timestamp("last_connected").defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  name: true,
  type: true,
  userId: true,
});

// Group Sessions
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  hostId: integer("host_id").notNull(),
  currentTrackId: integer("current_track_id"),
  settings: jsonb("settings"), // JSON for session settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  id: true,
  hostId: true,
  currentTrackId: true,
  settings: true,
});

// Session Members
export const sessionMembers = pgTable("session_members", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertSessionMemberSchema = createInsertSchema(sessionMembers).pick({
  sessionId: true,
  userId: true,
});

// Equalizer Presets
export const equalizerPresets = pgTable("equalizer_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  values: jsonb("values").notNull(), // Array of band values
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEqualizerPresetSchema = createInsertSchema(equalizerPresets).pick({
  name: true,
  userId: true,
  values: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = z.infer<typeof insertPlaylistTrackSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type SessionMember = typeof sessionMembers.$inferSelect;
export type InsertSessionMember = z.infer<typeof insertSessionMemberSchema>;

export type EqualizerPreset = typeof equalizerPresets.$inferSelect;
export type InsertEqualizerPreset = z.infer<typeof insertEqualizerPresetSchema>;
