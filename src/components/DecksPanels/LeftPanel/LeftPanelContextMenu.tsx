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

import { Trash2 } from "lucide-react";
import { MenuOps } from "../../common/menu/MenuOps";

interface ContextMenuProps {
  selectedPath: string | null;
  onRemove: (path: string) => Promise<void>;
}

export function LeftPanelContextMenu({
  selectedPath,
  onRemove,
}: ContextMenuProps) {
  const handleRemove = () => {
    if (selectedPath) {
      onRemove(selectedPath);
    }
  };

  const menuItems = [
    {
      label: (
        <div className='flex items-center'>
          <Trash2 className='w-4 h-4 mr-2' />
          Remove from Favorites
        </div>
      ),
      onClick: handleRemove,
      actionId: "remove-favorite",
      disabled: !selectedPath,
    },
  ];

  return <MenuOps menu_id='left-panel-context-menu' items={menuItems} />;
}
