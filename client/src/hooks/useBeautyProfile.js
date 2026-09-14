import { createContext, useContext } from "react";

export const BeautyProfileContext = createContext();

export function useBeautyProfile() {
  return useContext(BeautyProfileContext);
}
