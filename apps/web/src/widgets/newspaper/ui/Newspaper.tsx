import { useGetLatestNewsIssueQuery } from "@/entities/newsIssue";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { cn } from "@/shared/lib/cn";
import NewspaperDesktop from "./components/newspaperDesktop/NewspaperDesktop";
import NewspaperMobile from "./components/newspaperMobile/NewspaperMobile";
import PaperSheet from "./components/paperSheet/PaperSheet";

/** Пустой лист с названием газеты — пока номер грузится или если он не загрузился */
const BlankSheet = ({ isDesktop, message, busy }: { isDesktop: boolean; message: string; busy: boolean }) => (
  <PaperSheet
    className={cn(
      isDesktop ? "mx-auto w-full max-w-350 px-15 py-20" : "mx-2.5 px-4.5 py-12",
      "shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
    )}
  >
    <div aria-busy={busy} className="flex flex-col items-center gap-4 text-center">
      <span
        className={cn(
          "font-paper-display",
          isDesktop ? "text-[clamp(56px,5.2vw,100px)]" : "text-[min(46px,calc((100vw-60px)/7.6))]",
          "leading-none"
        )}
      >
        Винный Вѣстникъ
      </span>
      <span className="text-caption italic" role={busy ? "status" : "alert"}>
        {message}
      </span>
    </div>
  </PaperSheet>
);

/** Газета «Винный Вѣстникъ»: свежий выпуск из API — развёрнутый лист на десктопе, лента на мобильных */
const Newspaper = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { data: issue, isLoading, isError } = useGetLatestNewsIssueQuery();

  if (isError) {
    return <BlankSheet isDesktop={isDesktop} busy={false} message="Номер не напечатался — обновите страницу." />;
  }
  if (isLoading || !issue) {
    return <BlankSheet isDesktop={isDesktop} busy message="Свежий номер печатается…" />;
  }

  return isDesktop ? <NewspaperDesktop issue={issue} /> : <NewspaperMobile issue={issue} />;
};

export default Newspaper;
