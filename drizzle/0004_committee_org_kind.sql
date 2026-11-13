CREATE TABLE `committee_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`organization` text NOT NULL,
	`position` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `org_members` ADD `kind` text DEFAULT 'staff' NOT NULL;
--> statement-breakpoint
INSERT INTO `committee_members` (`name`, `organization`, `position`, `note`, `sort_order`) VALUES
	('여형범', '충남 탄소중립지원센터', '센터장', '충남연구원 기후환경연구실장, 국가 기후위기대응위원회 위원', 0),
	('이구용', '충남도립대학교', '교무학생처장', '충남 기후위기대응위원회 부위원장', 1),
	('박현섭', '충남소비자공익네트워크', '사무국장', '충남 기후위기대응위원회 탄소중립협력분과 위원장', 2),
	('정헌웅', '충남도청', '기후환경정책과장', '', 3),
	('노원택', '금강유역환경청', '대기환경관리단장', '', 4),
	('문충만', '대전 탄소중립지원센터', '센터장', '대전연구원 책임연구위원', 5),
	('이윤희', '세종 탄소중립지원센터', '센터장', '세종연구원 책임연구위원', 6),
	('안병일', '사회적협동조합 삶과기술', '이사장', '', 7),
	('명형남', '충남연구원', '연구기획실장', '', 8);
