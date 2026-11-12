CREATE TABLE `visit_daily` (
	`day` text PRIMARY KEY NOT NULL,
	`visitors` integer DEFAULT 0 NOT NULL,
	`page_views` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visit_seen` (
	`day` text NOT NULL,
	`hash` text NOT NULL,
	PRIMARY KEY(`day`, `hash`)
);
