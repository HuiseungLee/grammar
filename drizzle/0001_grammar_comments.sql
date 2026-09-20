CREATE TABLE IF NOT EXISTS `grammar_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_slug` text NOT NULL,
	`parent_id` integer,
	`user_id` text NOT NULL,
	`author_role` text NOT NULL CHECK (`author_role` IN ('teacher', 'student')),
	`author_name` text NOT NULL,
	`body` text NOT NULL CHECK (length(`body`) BETWEEN 1 AND 2000),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `grammar_comments`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_grammar_comments_lesson_created` ON `grammar_comments` (`lesson_slug`,`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_grammar_comments_parent_created` ON `grammar_comments` (`parent_id`,`created_at`);
