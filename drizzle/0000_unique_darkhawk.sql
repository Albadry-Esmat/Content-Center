CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`createdByUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`packData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `workspace_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','editor','reviewer','viewer') NOT NULL DEFAULT 'owner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspace_memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_memberships_workspace_user_unique` UNIQUE(`workspaceId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `projects_workspace_status_updated_idx` ON `projects` (`workspaceId`,`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `projects_workspace_idx` ON `projects` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `workspace_memberships_workspace_idx` ON `workspace_memberships` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `workspace_memberships_user_idx` ON `workspace_memberships` (`userId`);