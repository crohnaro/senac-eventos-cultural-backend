/*
  Warnings:

  - A unique constraint covering the columns `[eventId,userId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscription_eventId_userId_key" ON "Subscription"("eventId", "userId");
