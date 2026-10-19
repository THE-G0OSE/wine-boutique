export type ReviewTopic = "tasting" | "gift" | "reserve" | "hall" | "collection";
export type LetterStatus = "pending" | "published" | "rejected";

export interface Letter {
  id: string;
  authorName: string;
  city: string | null;
  text: string;
  status: LetterStatus;
  receivedAt: Date | null;
  publishedAt: Date | null;
  topic: ReviewTopic | null;
  greeting: string | null;
  postscript: string | null;
  signature: string | null;
}

/** Опубликованное письмо: редакторские поля заполнены — так требует контракт Review */
export interface PublishedLetter extends Letter {
  status: "published";
  topic: ReviewTopic;
  greeting: string;
  signature: string;
}

/** Нарушение правила письма; `code` уходит клиенту или в CLI модерации */
export class LetterRuleError extends Error {
  constructor(
    readonly code: "invalid_letter" | "not_found" | "not_pending" | "missing_editorial_fields",
    message: string
  ) {
    super(message);
  }
}

export interface IncomingLetter {
  name: string;
  city?: string;
  text: string;
}

/** Письмо с сайта: имя и хотя бы пара строк — пробелы не считаются */
export const acceptLetter = ({ name, city, text }: IncomingLetter, now: Date): Omit<Letter, "id"> => {
  const authorName = name.trim();
  const body = text.trim();
  if (!authorName || body.length < 10) {
    throw new LetterRuleError("invalid_letter", "Подпишите конверт и напишите хотя бы пару строк");
  }
  return {
    authorName,
    city: city?.trim() || null,
    text: body,
    status: "pending",
    receivedAt: now,
    publishedAt: null,
    topic: null,
    greeting: null,
    postscript: null,
    signature: null,
  };
};

export interface Editorial {
  topic: ReviewTopic;
  greeting: string;
  signature: string;
  postscript?: string | null;
}

/** Публикация модератором: только из pending и только с темой, обращением и подписью */
export const publishLetter = (letter: Letter, editorial: Editorial, now: Date): PublishedLetter => {
  if (letter.status !== "pending") {
    throw new LetterRuleError("not_pending", `Письмо уже ${letter.status === "published" ? "опубликовано" : "отклонено"}`);
  }
  const greeting = editorial.greeting.trim();
  const signature = editorial.signature.trim();
  if (!greeting || !signature) {
    throw new LetterRuleError("missing_editorial_fields", "Для публикации нужны тема, обращение и подпись");
  }
  return {
    ...letter,
    status: "published",
    publishedAt: now,
    topic: editorial.topic,
    greeting,
    signature,
    postscript: editorial.postscript?.trim() || null,
  };
};

export const rejectLetter = (letter: Letter): Letter => {
  if (letter.status !== "pending") {
    throw new LetterRuleError("not_pending", `Письмо уже ${letter.status === "published" ? "опубликовано" : "отклонено"}`);
  }
  return { ...letter, status: "rejected" };
};
