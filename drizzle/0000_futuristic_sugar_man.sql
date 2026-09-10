CREATE TABLE `grammar_lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`school_band` text DEFAULT '중학교' NOT NULL,
	`domain` text NOT NULL,
	`curriculum_code` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`content_json` text DEFAULT '{}' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_grammar_lessons_slug` ON `grammar_lessons` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_grammar_lessons_status_published` ON `grammar_lessons` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_grammar_lessons_owner_updated` ON `grammar_lessons` (`owner_id`,`updated_at`);--> statement-breakpoint
PRAGMA optimize;
