CREATE TABLE `admin_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`ip` text NOT NULL,
	`user_agent` text,
	`admin_id` integer,
	`category` text NOT NULL,
	`action` text NOT NULL,
	`target` text,
	`summary` text NOT NULL,
	`path` text
);
--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `admin_audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_ip_idx` ON `admin_audit_logs` (`ip`);--> statement-breakpoint
CREATE TABLE `related_sites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`logo_url` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`author_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password_hash` text,
	`owner_key_hash` text,
	`is_private` integer DEFAULT true NOT NULL,
	`answer` text,
	`answered_by` text,
	`answered_at` integer,
	`notified_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_inquiries`("id", "title", "content", "author_name", "email", "phone", "password_hash", "is_private", "answer", "answered_by", "answered_at", "notified_at", "created_at", "updated_at") SELECT "id", "title", "content", "author_name", "email", "phone", "password_hash", "is_private", "answer", "answered_by", "answered_at", "notified_at", "created_at", "updated_at" FROM `inquiries`;--> statement-breakpoint
DROP TABLE `inquiries`;--> statement-breakpoint
ALTER TABLE `__new_inquiries` RENAME TO `inquiries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `inquiries_created_idx` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `inquiries_owner_idx` ON `inquiries` (`owner_key_hash`);--> statement-breakpoint
ALTER TABLE `hero_slides` ADD `post_id` integer REFERENCES posts(id) ON DELETE cascade;--> statement-breakpoint
-- 기존 홈페이지 관련 사이트 16개 중 접속 불가 3개(충청남도서해안기후환경연구소·탄소중립 산업센터·충남녹색환경지원센터) 제외,
-- 명칭·주소 변경 2개(2050탄녹위 → 국가기후위기대응위원회, 환경부 → 기후에너지환경부) 교체 (2026-11-09 접속 확인)
INSERT INTO `related_sites` (`name`, `url`, `logo_url`, `sort_order`) VALUES
('충청남도 탄소중립 생활실천단 블로그', 'https://blog.naver.com/tansozeroclub', '/related-sites/tansozeroclub-blog.jpg', 10),
('충청남도 탄소중립 생활실천단 인스타그램', 'https://www.instagram.com/tansozeroclub/', '/related-sites/tansozeroclub-instagram.jpg', 20),
('기상청 기후정보포털', 'http://www.climate.go.kr/home/', '/related-sites/kma-climate.png', 30),
('탄소중립 포털', 'https://www.gihoo.or.kr', '/related-sites/gihoo.jpg', 40),
('기후에너지환경부', 'https://www.mcee.go.kr/', '/related-sites/mcee.png', 50),
('국가기후위기대응위원회', 'https://www.pcccr.go.kr/', '/related-sites/pcccr.png', 60),
('국가기후위기적응센터', 'https://kaccc.kei.re.kr/home/', '/related-sites/kaccc.jpg', 70),
('환경교육포털', 'https://www.keep.go.kr/', '/related-sites/keep.jpg', 80),
('광덕산환경교육센터', 'http://www.natureschool.or.kr', '/related-sites/natureschool.jpg', 90),
('한국환경공단', 'https://www.keco.or.kr/web/index.do', '/related-sites/keco.jpg', 100),
('충남도청', 'https://www.chungnam.go.kr/main.do', '/related-sites/chungnam.jpg', 110),
('충남지속가능발전협의회', 'http://www.cncsd.kr/', '/related-sites/cncsd.jpg', 120),
('온실가스종합정보센터', 'https://www.gir.go.kr/home/main.do', '/related-sites/gir.png', 130);
