import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">요청하신 페이지를 찾을 수 없습니다.</h1>
      <p className="text-muted-foreground">주소가 올바른지 확인해 주세요.</p>
      <ButtonLink href="/">홈으로</ButtonLink>
    </main>
  );
}
