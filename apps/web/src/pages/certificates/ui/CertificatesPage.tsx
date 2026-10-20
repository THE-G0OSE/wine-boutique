import { CertificateBuilder } from "@/widgets/certificateBuilder";
import { PageBackground } from "uikit;/";

const CertificatesPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Подарочные сертификаты · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Подарочный сертификат в погреб: 5 000, 10 000, 25 000 ₽ или своя сумма. Действует год на бутылки, дегустации, зал и набор месяца."
      />
      <PageBackground />
      <CertificateBuilder />
    </div>
  );
};

export default CertificatesPage;
