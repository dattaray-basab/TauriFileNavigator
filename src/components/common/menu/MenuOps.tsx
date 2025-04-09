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
import { useTheme } from "@/components/common";
import { ContextMenuItem } from "@/components/common/types/types";
import { Fragment } from "react";
import { Item, Menu, Separator } from "react-contexify";
import "react-contexify/ReactContexify.css";
export { useContextMenu } from "react-contexify";

export function MenuOps<T, P = any>({
  menu_id,
  items = [],
}: {
  menu_id: string;
  items: ContextMenuItem<T, P>[];
}) {
  const { theme, isDark } = useTheme();

  const menuStyle = {
    "--contexify-menu-bgColor": isDark ? "#1f2937" : "#ffffff",
    "--contexify-item-color": isDark ? "#ffffff" : "#111827",
    "--contexify-separator-color": isDark ? "#374151" : "#e5e7eb",
    "--contexify-item-disabled-color": isDark ? "#6b7280" : "#9ca3af",
    "--contexify-activeItem-bg": isDark ? "#374151" : "#f3f4f6",
  } as React.CSSProperties;

  // If no items are provided, don't render the menu
  if (items.length === 0) {
    return null;
  }

  return (
    <Menu
      id={menu_id}
      className={`${theme.shadow.med} rounded-md`}
      style={menuStyle}>
      {items.map((item, index) => (
        <Fragment key={`fragment-${menu_id}-${index}`}>
          <Item
            key={`item-${menu_id}-${index}`}
            id={String(item.actionId)}
            onClick={item.onClick}
            propsFromTrigger={item.props ?? {}}
            data={item.data ?? {}}
            disabled={item.disabled ?? false}
            className='px-2 py-1.5 text-sm cursor-pointer'>
            {item.label}
          </Item>
          {item.seperateNext && (
            <Separator key={`seperator-${menu_id}-${index}`} />
          )}
        </Fragment>
      ))}
    </Menu>
  );
}
