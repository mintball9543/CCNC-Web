import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { privacyPolicy as p } from "@/lib/config/privacy";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  alternates: { canonical: "/privacy" },
};

/**
 * 개인정보처리방침 — 「개인정보 보호법」 제30조, 같은 법 시행령 제31조,
 * 개인정보보호위원회 「개인정보 처리방침 작성지침(공공부문)」 구성에 따른다.
 * 수집 항목·보유 기간·쿠키는 실제 코드(src/lib/db/schema.ts 등)와 일치해야 한다. (ISSUES.md CONTENT-011)
 */

const ORG = siteConfig.name;

/** 센터가 아직 정하지 않은 값 — 공개 전에 src/lib/config/privacy.ts 에서 채운다 */
function Value({ value, label }: { value: string | null; label: string }) {
  if (value) return <>{value}</>;
  return (
    <mark className="rounded bg-amber-100 px-1 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
      [확인 필요: {label}]
    </mark>
  );
}

const SECTIONS = [
  { id: "purpose", title: "개인정보의 처리 목적" },
  { id: "items", title: "처리하는 개인정보 항목 및 보유 기간" },
  { id: "third-party", title: "개인정보의 제3자 제공" },
  { id: "processor", title: "개인정보 처리업무의 위탁" },
  { id: "destruction", title: "개인정보의 파기 절차 및 방법" },
  { id: "rights", title: "정보주체와 법정대리인의 권리·의무 및 행사 방법" },
  { id: "safety", title: "개인정보의 안전성 확보 조치" },
  { id: "cookies", title: "자동 수집 장치의 설치·운영 및 거부" },
  { id: "officer", title: "개인정보 보호책임자" },
  { id: "request", title: "개인정보 열람청구 접수·처리 부서" },
  { id: "remedy", title: "권익침해 구제 방법" },
  { id: "changes", title: "개인정보처리방침의 변경" },
] as const;

function Section({ index, children }: { index: number; children: ReactNode }) {
  const s = SECTIONS[index];
  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28 space-y-3">
      <h2 id={`${s.id}-title`} className="text-xl font-bold">
        제{index + 1}조 ({s.title})
      </h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <thead>
          <tr className="border-y-2 border-foreground/70 bg-muted/60">
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ol = "list-decimal space-y-1.5 pl-5";
const ul = "list-disc space-y-1.5 pl-5";

export default function Page() {
  return (
    <Container className="py-12">
      <h1 className="mb-6 text-3xl font-bold">개인정보처리방침</h1>

      <div className="max-w-4xl space-y-10 leading-relaxed">
        <p className="rounded-2xl bg-muted/60 p-5">
          {ORG}(이하 &lsquo;센터&rsquo;)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를
          보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보
          처리방침을 수립·공개합니다. 센터 홈페이지는 회원가입 없이 이용할 수 있으며, 문의 게시판을
          이용하는 경우에만 필요한 최소한의 개인정보를 수집합니다.
        </p>

        <nav aria-label="개인정보처리방침 목차" className="rounded-2xl border border-border p-5">
          <p className="mb-3 font-semibold">목차</p>
          <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:text-primary hover:underline">
                  제{i + 1}조 {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section index={0}>
          <p>
            센터는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 다음의 목적
            이외의 용도로는 이용하지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」
            제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.
          </p>
          <ol className={ol}>
            <li>
              <strong>문의 게시판 운영</strong>: 문의 접수, 작성자 본인 확인(비공개 문의 열람,
              작성한 문의의 수정·삭제), 답변 등록 및 답변 알림 전자우편 발송
            </li>
            <li>
              <strong>홈페이지 관리</strong>: 관리자 본인 확인, 부정 접속 방지, 개인정보 처리시스템
              접속기록 보관
            </li>
          </ol>
        </Section>

        <Section index={1}>
          <ol className={ol}>
            <li>
              센터는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집할 때
              동의받은 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
            </li>
            <li>처리하는 개인정보 항목과 보유 기간은 다음과 같습니다.</li>
          </ol>
          <Table
            head={["구분", "처리 항목", "처리 근거", "보유 기간"]}
            rows={[
              [
                "문의 게시판",
                <>
                  (필수) 이름, 이메일, 문의 제목·내용
                  <br />
                  (선택) 연락처
                  <br />
                  (비공개 문의) 비밀번호 — 복원할 수 없도록 암호화하여 저장
                </>,
                "정보주체의 동의 (「개인정보 보호법」 제15조 제1항 제1호)",
                <Value key="r" value={p.inquiryRetention} label="문의 개인정보 보유 기간" />,
              ],
              [
                "홈페이지 관리자",
                <>
                  (필수) 아이디, 이름, 비밀번호(암호화), 최근 로그인 일시
                  <br />
                  (접속기록) 접속 IP 주소, 브라우저 정보, 접속 일시, 수행 업무
                </>,
                "「개인정보 보호법」 제29조 및 「개인정보의 안전성 확보조치 기준」 제8조",
                <>
                  계정: 관리자 업무 종료 시까지
                  <br />
                  접속기록: {p.auditLogRetention}
                </>,
              ],
            ]}
          />
          <p className="text-sm text-muted-foreground">
            ※ 문의 게시판 목록에는 작성자 이름의 일부만 표시되며, 이메일·연락처는 공개되지 않습니다.
          </p>
          <p>
            센터가 처리하는 개인정보파일의 등록 현황은 개인정보 포털(
            <a
              href="https://www.privacy.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              www.privacy.go.kr
            </a>
            )의 &lsquo;개인정보파일 목록 검색&rsquo;에서 확인할 수 있습니다.
          </p>
        </Section>

        <Section index={2}>
          <p>
            센터는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만
            처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에
            해당하는 경우를 제외하고는 개인정보를 제3자에게 제공하지 않습니다. 현재 센터는
            개인정보를 제3자에게 제공하고 있지 않습니다.
          </p>
        </Section>

        <Section index={3}>
          <ol className={ol}>
            <li>
              센터는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고
              있습니다.
            </li>
          </ol>
          <Table
            head={["위탁받는 자(수탁자)", "위탁하는 업무의 내용"]}
            rows={p.processors.map((row) => [
              <Value key="c" value={row.company} label="수탁자" />,
              row.work,
            ])}
          />
          <ol className={ol} start={2}>
            <li>
              센터는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외
              개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독,
              손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게
              처리하는지를 감독합니다.
            </li>
            <li>
              위탁업무의 내용이나 수탁자가 변경될 경우에는 지체 없이 본 개인정보처리방침을 통하여
              공개합니다.
            </li>
          </ol>
        </Section>

        <Section index={4}>
          <ol className={ol}>
            <li>
              센터는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을
              때에는 지체 없이 해당 개인정보를 파기합니다.
            </li>
            <li>
              정보주체로부터 동의받은 보유 기간이 경과하거나 처리 목적이 달성되었음에도 불구하고
              다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의
              데이터베이스로 옮기거나 보관 장소를 달리하여 보존합니다.
            </li>
            <li>
              파기 절차: 파기 사유가 발생한 개인정보를 선정하고, 센터의 개인정보 보호책임자의 승인을
              받아 파기합니다.
            </li>
            <li>
              파기 방법: 전자적 파일 형태의 정보는 복구·재생할 수 없도록 기술적 방법으로 삭제하며,
              종이 문서에 기록된 개인정보는 분쇄하거나 소각하여 파기합니다. 관리자 접속기록은 보존
              기간이 지나면 자동으로 삭제됩니다.
            </li>
          </ol>
        </Section>

        <Section index={5}>
          <ol className={ol}>
            <li>
              정보주체는 센터에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 및 동의 철회
              등의 권리를 행사할 수 있습니다. 작성한 문의는 문의 게시판에서 직접 수정하거나 삭제할
              수도 있습니다.
            </li>
            <li>
              권리 행사는 「개인정보 보호법 시행령」 제41조 제1항에 따라 서면, 전자우편 등을 통하여
              할 수 있으며, 센터는 이에 대해 10일 이내에 조치하겠습니다.
            </li>
            <li>
              권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 할 수도
              있습니다. 이 경우 「개인정보 처리 방법에 관한 고시」 별지 제11호 서식에 따른 위임장을
              제출하여야 합니다.
            </li>
            <li>
              개인정보 열람 및 처리정지 요구는 「개인정보 보호법」 제35조 제4항, 제37조 제2항에
              의하여 정보주체의 권리가 제한될 수 있습니다.
            </li>
            <li>
              개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는
              경우에는 그 삭제를 요구할 수 없습니다.
            </li>
            <li>센터는 권리 행사를 한 자가 본인이거나 정당한 대리인인지를 확인합니다.</li>
            <li>
              만 14세 미만 아동이 문의를 작성하려는 경우에는 법정대리인의 동의를 받아야 하며,
              법정대리인은 아동의 개인정보에 대하여 위 권리를 행사할 수 있습니다.
            </li>
          </ol>
        </Section>

        <Section index={6}>
          <p>센터는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 하고 있습니다.</p>
          <ol className={ol}>
            <li>관리적 조치: 개인정보 취급자 최소화, 내부관리계획 수립·시행</li>
            <li>
              기술적 조치: 관리자 페이지 접근 권한 관리 및 로그인 시도 횟수 제한, 비밀번호의 일방향
              암호화 저장, 개인정보 처리시스템 접속기록의 보관, 보안 접속(HTTPS)을 통한 전송 구간
              암호화
            </li>
            <li>물리적 조치: 서버·자료 보관 장소의 비인가자 출입 통제</li>
          </ol>
        </Section>

        <Section index={7}>
          <ol className={ol}>
            <li>
              센터 홈페이지는 이용자를 식별하거나 맞춤형 광고를 하기 위한 쿠키, 외부 방문 분석
              도구를 사용하지 않습니다. 다만 다음 기능을 위해 필요한 최소한의 쿠키 등을 사용합니다.
            </li>
          </ol>
          <Table
            head={["이름", "목적", "저장 내용", "보관 기간"]}
            rows={[
              [
                "ccnc_inquiry_owner (쿠키)",
                "문의를 작성한 브라우저에서 내가 쓴 문의 확인 및 수정·삭제",
                "무작위 값 (센터 서버에는 이를 변환한 값만 저장)",
                `마지막 사용 후 ${p.inquiryOwnerCookieAge}`,
              ],
              [
                "ccnc_admin_session (쿠키)",
                "관리자 로그인 유지 (관리자에게만 발급)",
                "로그인 정보",
                p.adminSessionAge,
              ],
              [
                "ccnc:popup-hidden (브라우저 저장소)",
                "알림창 '오늘 하루 보지 않기'",
                "알림창 번호와 숨김 기한",
                "당일 자정까지 적용",
              ],
            ]}
          />
          <ol className={ol} start={2}>
            <li>
              방문자 수와 게시글 조회수는 같은 접속자를 하루에 한 번만 세기 위해 접속 IP 주소와
              브라우저 정보를 그날에만 쓰는 비밀 값과 섞어 되돌릴 수 없는 값으로 바꾸어 확인하며, IP
              주소 자체는 저장하지 않습니다. 이 값은 다음 날 삭제됩니다.
            </li>
            <li>
              정보주체는 웹 브라우저 설정(예: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트
              데이터)에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. 쿠키 저장을 거부하거나 삭제하면
              공개 문의를 작성한 브라우저에서 해당 문의를 수정·삭제할 수 없으며, 이 경우 제10조의
              부서로 요청하시기 바랍니다.
            </li>
          </ol>
        </Section>

        <Section index={8}>
          <p>
            센터는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의
            불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <Table
            head={["구분", "성명", "직위", "연락처"]}
            rows={[
              [
                "개인정보 보호책임자",
                <Value key="n" value={p.officer.name} label="성명" />,
                <Value key="p" value={p.officer.position} label="직위" />,
                <>
                  <Value value={p.officer.phone} label="전화" />
                  <br />
                  <Value value={p.officer.email} label="전자우편" />
                </>,
              ],
            ]}
          />
        </Section>

        <Section index={9}>
          <p>
            정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람 청구를 아래 부서에 할 수
            있으며, 센터는 정보주체의 개인정보 열람 청구가 신속하게 처리되도록 노력하겠습니다.
          </p>
          <Table
            head={["부서명", "담당자", "연락처"]}
            rows={[
              [
                <Value key="d" value={p.department.name} label="담당부서" />,
                <Value key="m" value={p.department.manager} label="담당자" />,
                <>
                  <Value value={p.department.phone} label="전화" />
                  <br />
                  <Value value={p.department.email} label="전자우편" />
                </>,
              ],
            ]}
          />
          <p>
            정보주체는 위 부서 외에 개인정보보호위원회의 &lsquo;개인정보 포털&rsquo;(
            <a
              href="https://www.privacy.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              www.privacy.go.kr
            </a>
            )을 통하여서도 개인정보 열람 청구를 할 수 있습니다.
          </p>
        </Section>

        <Section index={10}>
          <ol className={ol}>
            <li>
              정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
              한국인터넷진흥원 개인정보침해신고센터 등에 분쟁 해결이나 상담 등을 신청할 수 있습니다.
              <ul className={`${ul} mt-1.5`}>
                <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
                <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
                <li>경찰청: (국번없이) 182 (ecrm.police.go.kr)</li>
              </ul>
            </li>
            <li>
              「개인정보 보호법」 제35조(개인정보의 열람), 제36조(개인정보의 정정·삭제),
              제37조(개인정보의 처리정지 등)의 규정에 의한 요구에 대하여 공공기관의 장이 행한 처분
              또는 부작위로 인하여 권리 또는 이익의 침해를 받은 자는 「행정심판법」이 정하는 바에
              따라 행정심판을 청구할 수 있습니다.
              <ul className={`${ul} mt-1.5`}>
                <li>중앙행정심판위원회: (국번없이) 110 (www.simpan.go.kr)</li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section index={11}>
          <p>
            이 개인정보처리방침은 <Value value={p.effectiveDate} label="시행일" />
            부터 적용됩니다. 내용이 추가·삭제 또는 수정되는 경우에는 시행 전에 홈페이지를 통하여
            알려 드립니다.
          </p>
        </Section>
      </div>
    </Container>
  );
}
