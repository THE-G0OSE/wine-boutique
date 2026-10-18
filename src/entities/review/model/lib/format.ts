import type { ReviewTopic } from "../types";

/** Тема письма — строка «Тема:» на конверте и штемпель на мобильном */
export const REVIEW_TOPIC_LABELS: Record<ReviewTopic, string> = {
  tasting: "дегустация",
  gift: "подарок",
  reserve: "бронь и самовывоз",
  hall: "зал для ужина",
  collection: "коллекция",
};

const numeric = new Intl.DateTimeFormat("ru-RU");

/** Дата на штемпеле «16.10.2026»; пока неизвестна — плейсхолдер из дизайна */
export const formatReviewDate = (isoDate: string | null) =>
  isoDate === null ? "[дата]" : numeric.format(new Date(`${isoDate}T00:00:00`));

/** Город отправителя; нет — плейсхолдер из дизайна */
export const formatReviewCity = (city: string | null) => city ?? "[город]";
