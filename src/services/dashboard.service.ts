import { dashboardRepository } from "@/repositories/dashboard.repository";
import { merchantRepository } from "@/repositories/merchant.repository";
import { UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@/utils/errors";

export class DashboardService {
  async getAdminDashboard(userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can access the admin dashboard");
    }

    return dashboardRepository.getAdminMetrics();
  }

  async getUserDashboard(userId: string) {
    const metrics = await dashboardRepository.getUserMetrics(userId);
    if (!metrics) {
      throw new NotFoundError("User profile not found");
    }

    return metrics;
  }

  async getMerchantDashboard(userId: string, userRole: UserRole) {
    if (userRole !== UserRole.UMKM && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only merchants can access the merchant dashboard");
    }

    const merchant = await merchantRepository.findByOwnerId(userId);
    if (!merchant) {
      throw new NotFoundError("Merchant profile not registered for this user");
    }

    return dashboardRepository.getMerchantMetrics(merchant.id);
  }
}

export const dashboardService = new DashboardService();
