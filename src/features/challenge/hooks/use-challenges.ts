import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listChallenges,
  getChallenge,
  joinChallenge,
  leaveChallenge,
  listMyChallenges,
} from "../api";

export function useChallenges(params: { categoryId?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ["challenges", params],
    queryFn: async () => {
      const res = await listChallenges(params);
      return res.data;
    },
  });
}

export function useChallenge(id: string) {
  return useQuery({
    queryKey: ["challenge", id],
    queryFn: async () => {
      const res = await getChallenge(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => joinChallenge(challengeId),
    onSuccess: (_, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge", challengeId] });
      queryClient.invalidateQueries({ queryKey: ["my-challenges"] });
    },
  });
}

export function useLeaveChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveChallenge(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      queryClient.invalidateQueries({ queryKey: ["my-challenges"] });
    },
  });
}

export function useMyChallenges() {
  return useQuery({
    queryKey: ["my-challenges"],
    queryFn: async () => {
      const res = await listMyChallenges();
      return res.data;
    },
  });
}
