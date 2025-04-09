import { atom } from "jotai";

export type OSType = "Windows" | "macOS" | "Linux";

export const osTypeAtom = atom<OSType>("Windows");
