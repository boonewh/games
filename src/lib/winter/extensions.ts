import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'

export const winterEditorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4],
    },
  }),
  Typography,
  Placeholder.configure({
    placeholder: 'Describe the next chapter of your winter saga…',
  }),
]
