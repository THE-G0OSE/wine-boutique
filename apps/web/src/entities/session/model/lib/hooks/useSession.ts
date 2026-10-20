import { useGetSessionQuery } from "../../../api/sessionApi";

/** Текущий посетитель: user = null — гость (и пока сессия грузится — тогда isLoading) */
export const useSession = () => {
  const { data, isLoading } = useGetSessionQuery();
  const user = data?.user ?? null;
  return { user, isAuthed: user !== null, isLoading };
};
