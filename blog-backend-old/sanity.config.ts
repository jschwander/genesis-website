import {defineConfig, definePlugin} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import CustomRichTextTool from './CustomRichTextTool'
import { colorInput } from '@sanity/color-input'
import { codeInput } from '@sanity/code-input'

// Define the custom tool as a proper Sanity plugin
const richTextPlugin = definePlugin({
  name: 'rich-text-playground',
  tools: [
    {
      name: 'rich-text-playground',
      title: 'Rich Text Playground',
      component: CustomRichTextTool,
      icon: () => '📝',
    }
  ]
})

export default defineConfig({
  name: 'default',
  title: 'genesis-blog',

  projectId: '80jerngq',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    colorInput(),
    codeInput(),
    richTextPlugin(),
  ],

  schema: {
    types: schemaTypes,
  },
})
