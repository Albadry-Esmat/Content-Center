CREATE TABLE `project_generation_runs` (
	`id` varchar(80) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`status` enum('running','complete','partial','cancelled') NOT NULL DEFAULT 'running',
	`tasks` json NOT NULL,
	`startedAt` timestamp NOT NULL,
	`finishedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_generation_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_pack_versions` (
	`id` varchar(36) NOT NULL,
	`workspaceId` varchar(36) NOT NULL,
	`projectId` varchar(36) NOT NULL,
	`revision` int NOT NULL,
	`source` enum('manual_save','restore','run_completion') NOT NULL DEFAULT 'manual_save',
	`packData` json NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_pack_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_pack_versions_project_revision_unique` UNIQUE(`projectId`,`revision`)
);
--> statement-breakpoint
CREATE INDEX `project_generation_runs_workspace_project_started_idx` ON `project_generation_runs` (`workspaceId`,`projectId`,`startedAt`);--> statement-breakpoint
CREATE INDEX `project_pack_versions_workspace_project_created_idx` ON `project_pack_versions` (`workspaceId`,`projectId`,`createdAt`);