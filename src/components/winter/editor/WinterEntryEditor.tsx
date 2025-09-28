'use client'

import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { EditorContent, useEditor, type JSONContent, type Editor } from '@tiptap/react'
import { winterEditorExtensions } from '@/lib/winter/extensions'

interface Props {
  value: JSONContent
  onChange: (content: JSONContent) => void
  onRequestPhoto: () => void
}

export interface WinterEntryEditorHandle {
  insertPhotoToken: (photoId: string) => void
}

export const WinterEntryEditor = forwardRef<WinterEntryEditorHandle, Props>(
  ({ value, onChange, onRequestPhoto }, ref) => {
    const editor = useEditor({
      extensions: winterEditorExtensions,
      content: value,
      editorProps: {
        attributes: {
          class:
            'min-h-[400px] rounded-lg border border-slate-700 bg-slate-900/60 p-4 focus:outline-none',
        },
      },
      onUpdate({ editor }) {
        onChange(editor.getJSON())
      },
    })

    useEffect(() => {
      if (!editor) {
        return
      }

      const current = editor.getJSON()
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        editor.commands.setContent(value)
      }
    }, [editor, value])

    useImperativeHandle(ref, () => ({
      insertPhotoToken(photoId) {
        if (!editor) return
        editor.chain().focus().insertContent(`{{photo:${photoId}}}`).run()
      },
    }))

    const applyMark = (command: (editor: Editor) => void) => () => {
      if (!editor) return
      command(editor)
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 p-2">
          <button
            type="button"
            onClick={applyMark((editor) => editor.chain().focus().toggleBold().run())}
            className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Bold
          </button>
          <button
            type="button"
            onClick={applyMark((editor) => editor.chain().focus().toggleItalic().run())}
            className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Italic
          </button>
          <button
            type="button"
            onClick={applyMark((editor) => editor.chain().focus().toggleBulletList().run())}
            className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Bullets
          </button>
          <button
            type="button"
            onClick={applyMark((editor) => editor.chain().focus().toggleOrderedList().run())}
            className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Numbers
          </button>
          <button
            type="button"
            onClick={applyMark((editor) => editor.chain().focus().toggleBlockquote().run())}
            className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Quote
          </button>
          <button
            type="button"
            onClick={applyMark((editor) => editor.chain().focus().setHorizontalRule().run())}
            className="rounded bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            Divider
          </button>
          <button
            type="button"
            onClick={() => onRequestPhoto()}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Insert photo token
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>
    )
  },
)

WinterEntryEditor.displayName = 'WinterEntryEditor'
