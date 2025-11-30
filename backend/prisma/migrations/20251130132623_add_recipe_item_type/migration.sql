-- AlterTable
ALTER TABLE "RecipeItem" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ingredient';

-- CreateIndex
CREATE INDEX "RecipeItem_type_idx" ON "RecipeItem"("type");
