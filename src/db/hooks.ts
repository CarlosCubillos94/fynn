import { createId } from "@/domain/id";
import type { Budget, Transaction } from "@/domain/types";
import {
  clearSample,
  deleteTransaction,
  getDatabase,
  listBudgets,
  listTransactions,
  restoreSample,
  saveBudget,
  saveTransaction,
} from "@/db/database";
import { queryClient } from "@/state/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => listTransactions(await getDatabase()),
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => listBudgets(await getDatabase()),
  });
}

function invalidateLedger() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  ]);
}

export function useSaveTransaction() {
  return useMutation({
    mutationFn: async (transaction: Transaction) => saveTransaction(await getDatabase(), transaction),
    onSuccess: invalidateLedger,
  });
}

export function useDeleteTransaction() {
  return useMutation({
    mutationFn: async (id: string) => deleteTransaction(await getDatabase(), id),
    onSuccess: invalidateLedger,
  });
}

export function useSaveBudget() {
  return useMutation({
    mutationFn: async (budget: Budget) => {
      await saveBudget(await getDatabase(), { ...budget, id: budget.id || createId() });
    },
    onSuccess: invalidateLedger,
  });
}

export function useClearSample() {
  return useMutation({
    mutationFn: async () => clearSample(await getDatabase()),
    onSuccess: invalidateLedger,
  });
}

export function useRestoreSample() {
  return useMutation({
    mutationFn: async () => restoreSample(await getDatabase()),
    onSuccess: invalidateLedger,
  });
}
