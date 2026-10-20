import { StorageGuide } from "@/widgets/storageGuide";
import { PageBackground } from "uikit;/";

const StoragePage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-42">
      <title>Как хранить вино · Premium Wine Boutique</title>
      <meta
        name="description"
        content="Справочник погреба: температура подачи по типам вин, как класть бутылку, условия хранения дома и сколько вино может ждать."
      />
      <PageBackground />
      <StorageGuide />
    </div>
  );
};

export default StoragePage;
