CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`username` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
