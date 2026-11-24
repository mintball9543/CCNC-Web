CREATE TABLE `post_view_seen` (
	`day` text NOT NULL,
	`post_id` integer NOT NULL,
	`hash` text NOT NULL,
	PRIMARY KEY(`day`, `post_id`, `hash`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `view_count` integer DEFAULT 0 NOT NULL;