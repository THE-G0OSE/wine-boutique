import { useGetSessionQuery } from "../../../api/sessionApi";

/** Текущий посетитель: user = null — гость (и пока сессия грузится) */
export const useSession = () => {
  const { data } = useGetSessionQuery();
  const user = data?.user ?? null;
  return { user, isAuthed: user !== null };
};
