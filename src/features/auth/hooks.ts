import { fetchClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const authApi = {
  login: async (credentials: any) => {
    return fetchClient<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  getMe: async () => {
    return fetchClient<any>("/api/auth/me", {
      method: "GET",
    });
  },
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Typically backend returns { accessToken } which we can store
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    retry: false,
  });
};
