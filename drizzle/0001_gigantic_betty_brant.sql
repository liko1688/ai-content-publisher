CREATE TABLE `articles` (
	`id` varchar(64) NOT NULL,
	`keyword` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`status` enum('draft','published','failed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp DEFAULT (now()),
	`publishedAt` timestamp,
	`userId` varchar(64) NOT NULL,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postLogs` (
	`id` varchar(64) NOT NULL,
	`scheduledPostId` varchar(64) NOT NULL,
	`platform` enum('facebook','twitter','instagram') NOT NULL,
	`postId` text,
	`status` enum('success','failed') NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `postLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledPosts` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`articleId` varchar(64) NOT NULL,
	`keyword` text NOT NULL,
	`platforms` text NOT NULL,
	`scheduledTime` timestamp NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	`executedAt` timestamp,
	CONSTRAINT `scheduledPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialAccounts` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`platform` enum('facebook','twitter','instagram') NOT NULL,
	`accountName` text NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `socialAccounts_id` PRIMARY KEY(`id`)
);
