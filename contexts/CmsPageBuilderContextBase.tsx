import { createContext, useContext, type ReactNode } from "react";

import type {
  CmsDesignTokenMap,
  CmsPageConfigMap,
  CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";

export interface CmsPageBuilderContextValue {
  isLoading: boolean;
  textOverrides: CmsTextOverrideMap;
  pageConfigs: CmsPageConfigMap;
  designTokens: CmsDesignTokenMap;
  customCss: string;
}

export const CMS_PAGE_BUILDER_DEFAULT_CONTEXT: CmsPageBuilderContextValue = {
  isLoading: false,
  textOverrides: {},
  pageConfigs: {},
  designTokens: {},
  customCss: "",
};

const CmsPageBuilderContext = createContext<CmsPageBuilderContextValue>(
  CMS_PAGE_BUILDER_DEFAULT_CONTEXT,
);

export function CmsPageBuilderContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: CmsPageBuilderContextValue;
}) {
  return (
    <CmsPageBuilderContext.Provider value={value}>
      {children}
    </CmsPageBuilderContext.Provider>
  );
}

export function useCmsPageBuilderContext() {
  return useContext(CmsPageBuilderContext);
}
