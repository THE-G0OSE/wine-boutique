import type { FC } from "react";
import { useNavigate } from "react-router";
import { baseApi } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { Button } from "uikit;/";
import { useSignOutMutation } from "../api/signOutApi";

interface IProps {
  className?: string;
}

/** Выйти: сессия отзывается на сервере, cookie стирается, гость уходит на главную */
const SignOutButton: FC<IProps> = ({ className }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signOut, { isLoading }] = useSignOutMutation();
  return (
    <Button
      variant="outline"
      disabled={isLoading}
      onClick={async () => {
        await signOut();
        // Данные кабинета не должны пережить выход
        dispatch(baseApi.util.resetApiState());
        navigate(ROUTES.home, { replace: true });
      }}
      className={className}
    >
      {isLoading ? "Выходим…" : "Выйти"}
    </Button>
  );
};

export default SignOutButton;
