-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectOption" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStatus" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "statusOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskProject" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "projectOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "columns" JSONB NOT NULL,
    "sortField" TEXT NOT NULL DEFAULT 'created',
    "sortOrder" TEXT NOT NULL DEFAULT 'desc',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryCategory" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grocery" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "menge" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Grocery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryCategoryAssignment" (
    "id" TEXT NOT NULL,
    "groceryId" TEXT NOT NULL,
    "groceryCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryCategoryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StatusOption_value_key" ON "StatusOption"("value");

-- CreateIndex
CREATE INDEX "StatusOption_order_idx" ON "StatusOption"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectOption_value_key" ON "ProjectOption"("value");

-- CreateIndex
CREATE INDEX "ProjectOption_order_idx" ON "ProjectOption"("order");

-- CreateIndex
CREATE INDEX "TaskStatus_taskId_idx" ON "TaskStatus"("taskId");

-- CreateIndex
CREATE INDEX "TaskStatus_statusOptionId_idx" ON "TaskStatus"("statusOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStatus_taskId_statusOptionId_key" ON "TaskStatus"("taskId", "statusOptionId");

-- CreateIndex
CREATE INDEX "TaskProject_taskId_idx" ON "TaskProject"("taskId");

-- CreateIndex
CREATE INDEX "TaskProject_projectOptionId_idx" ON "TaskProject"("projectOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskProject_taskId_projectOptionId_key" ON "TaskProject"("taskId", "projectOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "GroceryCategory_order_idx" ON "GroceryCategory"("order");

-- CreateIndex
CREATE INDEX "Grocery_userId_idx" ON "Grocery"("userId");

-- CreateIndex
CREATE INDEX "Grocery_createdAt_idx" ON "Grocery"("createdAt");

-- CreateIndex
CREATE INDEX "GroceryCategoryAssignment_groceryId_idx" ON "GroceryCategoryAssignment"("groceryId");

-- CreateIndex
CREATE INDEX "GroceryCategoryAssignment_groceryCategoryId_idx" ON "GroceryCategoryAssignment"("groceryCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GroceryCategoryAssignment_groceryId_groceryCategoryId_key" ON "GroceryCategoryAssignment"("groceryId", "groceryCategoryId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatus" ADD CONSTRAINT "TaskStatus_statusOptionId_fkey" FOREIGN KEY ("statusOptionId") REFERENCES "StatusOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProject" ADD CONSTRAINT "TaskProject_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProject" ADD CONSTRAINT "TaskProject_projectOptionId_fkey" FOREIGN KEY ("projectOptionId") REFERENCES "ProjectOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grocery" ADD CONSTRAINT "Grocery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryCategoryAssignment" ADD CONSTRAINT "GroceryCategoryAssignment_groceryId_fkey" FOREIGN KEY ("groceryId") REFERENCES "Grocery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryCategoryAssignment" ADD CONSTRAINT "GroceryCategoryAssignment_groceryCategoryId_fkey" FOREIGN KEY ("groceryCategoryId") REFERENCES "GroceryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
