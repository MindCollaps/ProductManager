-- DropForeignKey
ALTER TABLE "PartOrder" DROP CONSTRAINT "PartOrder_workItemId_fkey";

-- AddForeignKey
ALTER TABLE "PartOrder" ADD CONSTRAINT "PartOrder_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "RepairWorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
