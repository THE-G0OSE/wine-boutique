import { PrivacyDocument } from "@/widgets/privacyDocument";
import { PageBackground } from "uikit;/";

const PrivacyPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Политика конфиденциальности · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Какие данные собирает винный бутик, зачем, кому передаёт и как долго хранит — коротко и по пунктам."
      />
      <PageBackground />
      <PrivacyDocument />
    </div>
  );
};

export default PrivacyPage;
