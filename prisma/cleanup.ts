import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting database cleanup...");

  try {
    // 1. Delete order items
    console.log("- Deleting Order Items...");
    await prisma.orderItem.deleteMany({});

    // 2. Delete orders
    console.log("- Deleting Orders...");
    await prisma.order.deleteMany({});

    // 3. Delete product images
    console.log("- Deleting Product Images...");
    await prisma.productImage.deleteMany({});

    // 4. Delete products
    console.log("- Deleting Products...");
    await prisma.product.deleteMany({});

    // 5. Delete merchants
    console.log("- Deleting Merchants...");
    await prisma.merchant.deleteMany({});

    // 6. Delete activity verifications, photos, and activities
    console.log("- Deleting Activity Verifications...");
    await prisma.activityVerification.deleteMany({});
    console.log("- Deleting Activity Photos...");
    await prisma.activityPhoto.deleteMany({});
    console.log("- Deleting Activities...");
    await prisma.activity.deleteMany({});

    // 7. Delete challenge participations and progresses
    console.log("- Deleting Challenge Participants & Progress...");
    await prisma.challengeParticipant.deleteMany({});
    await prisma.challengeProgress.deleteMany({});

    // 8. Delete voucher redemptions
    console.log("- Deleting Voucher Redemptions...");
    await prisma.voucherRedemption.deleteMany({});

    // 9. Delete user auth sessions, accounts, and refresh tokens
    console.log("- Deleting Accounts, Sessions & Refresh Tokens...");
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.refreshToken.deleteMany({});

    // 10. Delete point histories
    console.log("- Deleting Point Histories...");
    await prisma.pointHistory.deleteMany({});

    // 11. Delete all users except the Administrator
    console.log("- Deleting dummy users (keeping admin@ecolution.id)...");
    const deleteUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: "admin@ecolution.id",
        },
      },
    });

    console.log(`✅ Cleanup completed successfully!`);
    console.log(`👤 Deleted ${deleteUsers.count} dummy user accounts.`);
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
