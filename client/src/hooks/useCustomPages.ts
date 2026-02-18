import { useState, useCallback, useEffect } from "react";
import { trpc } from "../lib/trpc";

export type PageType = "dashboard" | "table" | "report";
export type WorkspaceId = "leaks" | "privacy";

export interface CustomPage {
  id: number;
  userId: number;
  workspace: string;
  pageType: string;
  title: string;
  icon: string;
  sortOrder: number;
  config: any;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export function useCustomPages(workspace: WorkspaceId) {
  const utils = trpc.useUtils();

  // Fetch pages for this workspace
  const pagesQuery = trpc.customPages.list.useQuery(
    { workspace },
    { 
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );

  const createMutation = trpc.customPages.create.useMutation({
    onSuccess: () => {
      utils.customPages.list.invalidate();
    },
  });

  const updateMutation = trpc.customPages.update.useMutation({
    onSuccess: () => {
      utils.customPages.list.invalidate();
    },
  });

  const deleteMutation = trpc.customPages.delete.useMutation({
    onSuccess: () => {
      utils.customPages.list.invalidate();
    },
  });

  const pages = (pagesQuery.data || []) as CustomPage[];
  const isLoading = pagesQuery.isLoading;

  const createPage = useCallback(
    async (pageType: PageType, title: string, config?: any) => {
      const maxSort = pages.reduce((max, p) => Math.max(max, p.sortOrder), 0);
      const result = await createMutation.mutateAsync({
        workspace,
        pageType,
        title,
        icon: pageType === "dashboard" ? "LayoutDashboard" : pageType === "table" ? "Table2" : "FileText",
        sortOrder: maxSort + 1,
        config: config || {},
      });
      return result;
    },
    [workspace, pages, createMutation]
  );

  const updatePage = useCallback(
    async (id: number, data: { title?: string; icon?: string; sortOrder?: number; config?: any }) => {
      return updateMutation.mutateAsync({ id, ...data });
    },
    [updateMutation]
  );

  const deletePage = useCallback(
    async (id: number) => {
      return deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  return {
    pages,
    isLoading,
    createPage,
    updatePage,
    deletePage,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: () => utils.customPages.list.invalidate(),
  };
}
