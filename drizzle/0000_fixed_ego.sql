CREATE TABLE `guilds` (
	`guild_id` text PRIMARY KEY NOT NULL,
	`lobby_voice_id` text,
	`room_category_id` text
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text,
	`room_id` text,
	`owner_id` text
);
