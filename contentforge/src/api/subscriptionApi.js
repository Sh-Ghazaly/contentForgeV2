import api from "./client";

export default {
  async getUsage() {
    return await api.get("/subscription/usage");
  },

  async getPlans() {
    return await api.get("/subscription/plans");
  },

  async upgrade(planKey) {
    return await api.post("/subscription/upgrade", { planKey });
  },

  async cancel() {
    return await api.post("/subscription/cancel");
  },
};