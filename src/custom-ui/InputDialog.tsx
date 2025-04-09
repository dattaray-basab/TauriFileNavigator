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

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

interface InputDialogProps {
  title: string;
  message: string;
  placeholder?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  title,
  message,
  placeholder = "",
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Log to verify the component is rendering
  console.log("InputDialog rendering", { isOpen, title, message });

  return ReactDOM.createPortal(
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}>
      <div
        className='bg-white rounded-lg shadow-lg p-6 w-96 max-w-full'
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "400px",
          maxWidth: "90%",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}>
        <h2
          className='text-xl font-semibold mb-4'
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "16px",
          }}>
          {title}
        </h2>

        <p className='mb-4' style={{ marginBottom: "16px" }}>
          {message}
        </p>

        <input
          type='text'
          className='w-full px-3 py-2 border border-gray-300 rounded-md mb-4'
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "16px",
            boxSizing: "border-box",
          }}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        <div
          className='flex justify-end space-x-2'
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}>
          <button
            className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100'
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={onClose}>
            Cancel
          </button>
          <button
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={handleConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
