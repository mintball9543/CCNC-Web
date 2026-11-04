CREATE TABLE `chart_datasets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`chart_type` text DEFAULT 'bar' NOT NULL,
	`category_label` text DEFAULT '연도' NOT NULL,
	`series` text NOT NULL,
	`rows` text NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`source_url` text,
	`is_published` integer DEFAULT false NOT NULL,
	`show_on_home` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chart_datasets_slug_unique` ON `chart_datasets` (`slug`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`storage_key` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`kind` text NOT NULL,
	`post_id` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_storage_key_unique` ON `files` (`storage_key`);--> statement-breakpoint
CREATE INDEX `files_post_idx` ON `files` (`post_id`);--> statement-breakpoint
CREATE TABLE `hero_slides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_url` text NOT NULL,
	`image_alt` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`link_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `menu_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `org_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`department` text NOT NULL,
	`position` text NOT NULL,
	`name` text NOT NULL,
	`duties` text DEFAULT '' NOT NULL,
	`phone` text,
	`email` text,
	`is_head` integer DEFAULT false NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stat_highlights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`value` integer NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `inquiries` ADD `notified_at` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `format` text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `thumbnail_url` text;