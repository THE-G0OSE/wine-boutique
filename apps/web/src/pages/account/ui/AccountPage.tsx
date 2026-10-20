import { Navigate } from "react-router";
import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { AccountDashboard } from "@/widgets/accountDashboard";
import { PageBackground } from "uikit;/";

/** Кабинет только для вошедших: гостя — на вход (пока сессия грузится, ничего не решаем) */
const AccountPage = () => {
  const { isAuthed, isLoading } = useSession();
  if (!isLoading && !isAuthed) return <Navigate to={ROUTES.auth} replace />;
  return (
    <div className="relative isolate pt-22 lg:pt-38">
      <title>Личный кабинет · Premium Wine Boutique</title>
      <meta name="robots" content="noindex" />
      <PageBackground variant="cellar" />
      {isAuthed ? <AccountDashboard /> : null}
    </div>
  );
};

export default AccountPage;
