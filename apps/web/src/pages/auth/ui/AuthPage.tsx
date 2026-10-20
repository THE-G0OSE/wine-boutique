import { AuthWelcome } from "@/widgets/authWelcome";
import { PageBackground } from "uikit;/";

const AuthPage = () => {
  return (
    <div className="relative isolate pt-22 lg:pt-24">
      <title>Вход · Premium Wine Boutique</title>
      <meta name="description" content="Вход и регистрация в клубе гостей погреба по номеру телефона: брони, ячейка, записи на дегустации и бонусы." />
      <PageBackground variant="cellar" />
      <AuthWelcome />
    </div>
  );
};

export default AuthPage;
