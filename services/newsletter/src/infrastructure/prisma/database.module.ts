import { Module } from "@nestjs/common";
import { SubscriptionRepository } from "../../application/subscribe.js";
import { NewsletterPrisma } from "./newsletter-prisma.js";
import { PrismaSubscriptionRepository } from "./prisma-subscription.repository.js";

@Module({
  providers: [NewsletterPrisma, { provide: SubscriptionRepository, useClass: PrismaSubscriptionRepository }],
  exports: [NewsletterPrisma, SubscriptionRepository],
})
export class DatabaseModule {}
