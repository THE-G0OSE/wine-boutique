import { useId } from "react";
import { AgeConfirmPanel, selectIsAgeConfirmed } from "@/features/age/confirmAge";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { Modal } from "uikit;/";

/** Модалка 18+ при первом входе: поверх размытой страницы, закрывается только ответом «Да» */
const AgeGate = () => {
  const confirmed = useAppSelector(selectIsAgeConfirmed);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={!confirmed}
      labelledBy={titleId}
      describedBy={descriptionId}
      backdropClassName="cursor-default backdrop-blur-[10px] bg-[radial-gradient(ellipse_900px_700px_at_50%_50%,rgba(17,12,10,0.35)_0%,rgba(8,6,5,0.85)_100%)]"
      className="w-full max-w-180 rounded-3xl border border-amber-200/35 bg-cellar-900 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.7)] lg:rounded-[28px] lg:p-4"
    >
      <AgeConfirmPanel titleId={titleId} descriptionId={descriptionId} />
    </Modal>
  );
};

export default AgeGate;
