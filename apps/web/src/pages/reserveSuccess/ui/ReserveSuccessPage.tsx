import { useParams } from "react-router";
import { ReservationReceipt } from "@/widgets/reservationReceipt";
import { PageBackground } from "uikit;/";

const ReserveSuccessPage = () => {
  const { id = "" } = useParams();

  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Бронь принята · Premium Wine Boutique</title>
      <meta name="robots" content="noindex" />
      <PageBackground />
      <ReservationReceipt key={id} id={id} />
    </div>
  );
};

export default ReserveSuccessPage;
