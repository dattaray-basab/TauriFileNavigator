import { atom } from "jotai";

export type OSType = "windows" | "macos" | "linux" | "unknown";

export const osTypeAtom = atom<OSType>("unknown");
