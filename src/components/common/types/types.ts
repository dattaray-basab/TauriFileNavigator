/**
 * MIT License
 *
 * Copyright (c) 2025 Basab Dattaray
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * The author would like to give special thanks to the contributors of https://github.com/Souvlaki42/file-manager.git
 * for providing inspiration for this project.
 */

import { ItemParams } from "react-contexify";
// import { NODE_KINDS } from "./constants";

export interface NodeDetails {
  name: string;
  path: string;
  parentPath?: string;
  kind: "Directory" | "File";
  children?: ReadonlyArray<NodeDetails> | NodeDetails[];
  hidden: boolean;
  size: number;
  created: Date;
  modified: Date;
}

export type DirectoryPaths = {
  trash: string;
  desktop: string;
  downloads: string;
  documents: string;
  pictures: string;
  music: string;
  videos: string;
};

export interface ContextMenuItem<T, P = any> {
  label: React.ReactNode;
  onClick: (args: ItemParams<T, P>) => void;
  actionId: string;
  seperateNext?: boolean;
  disabled?: boolean;
  props?: P;
  data?: T;
}
