import { Injectable } from "@nestjs/common";

/** Хранилище подписок — порт */
export abstract class SubscriptionRepository {
  /** Подписан (или подписан снова после отписки); повтор — без дубля */
  abstract activate(email: string, source: string): Promise<void>;
}

/**
 * Подписка на анонсы. Повторная подписка — тот же ответ, без дубля и без подсказки,
 * был ли адрес в базе (иначе форму можно использовать, чтобы проверять чужие адреса).
 * Сервис простой — по правилам архитектуры слой domain не заводим.
 */
@Injectable()
export class Subscribe {
  constructor(private readonly subscriptions: SubscriptionRepository) {}

  execute(email: string, source = "footer"): Promise<void> {
    return this.subscriptions.activate(email.trim(), source);
  }
}
