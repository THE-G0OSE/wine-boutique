import { Injectable } from "@nestjs/common";
import { SubscriptionRepository } from "../../application/subscribe.js";
import { NewsletterPrisma } from "./newsletter-prisma.js";

@Injectable()
export class PrismaSubscriptionRepository extends SubscriptionRepository {
  constructor(private readonly prisma: NewsletterPrisma) {
    super();
  }

  async activate(email: string, source: string): Promise<void> {
    // email — citext: регистр не важен для уникальности
    await this.prisma.subscription.upsert({
      where: { email },
      create: { email, source, status: "active" },
      update: { status: "active" },
    });
  }
}
