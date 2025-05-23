import React, { useState } from 'react'
import { Card, Stack, Text, Button } from '@sanity/ui'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'

export default function CustomRichTextTool() {
  const [saved, setSaved] = useState(false)
  const [customColor, setCustomColor] = useState('#ff6b35')
  const [imageUrl, setImageUrl] = useState('')
  const [customWidth, setCustomWidth] = useState('')
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle, // Required for Color extension
      Superscript,
      Subscript,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto; display: block; margin: 10px auto;'
        }
      }),
    ],
    content: '<p>Edit your blog post here. Try <strong>bold</strong>, <em>italic</em>, <sup>superscript</sup>, <sub>subscript</sub>, <span style="color: red">color</span>, images, and alignment!</p>',
  })

  const saveContent = () => {
    if (!editor) return;
    navigator.clipboard.writeText(editor.getHTML())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const applyCustomColor = () => {
    if (!editor) return;
    
    // If no text is selected, show an alert
    const { from, to } = editor.state.selection;
    if (from === to) {
      alert('Please select some text first, then choose a color and click "Apply Color"');
      return;
    }
    
    // Apply color to selected text
    editor.chain().focus().setColor(customColor).run();
  }

  const addImageByUrl = () => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus().setImage({ 
      src: imageUrl,
      style: 'max-width: 400px; height: auto; display: block; margin: 10px auto;'
    }).run();
    setImageUrl(''); // Clear the input
  }

  const addImageByFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      editor.chain().focus().setImage({ 
        src,
        style: 'max-width: 400px; height: auto; display: block; margin: 10px auto;'
      }).run();
    };
    reader.readAsDataURL(file);
    
    // Clear the file input
    event.target.value = '';
  }

  const resizeImage = (width: string) => {
    if (!editor) return;
    
    // Get current selection
    const { state } = editor;
    const { selection } = state;
    
    // Check if an image is selected or update the last image
    const images = editor.view.dom.querySelectorAll('img');
    if (images.length === 0) {
      alert('Please add an image first!');
      return;
    }
    
    // Get the last image or selected image
    const lastImage = images[images.length - 1] as HTMLImageElement;
    
    if (width === 'custom' && customWidth) {
      lastImage.style.maxWidth = `${customWidth}px`;
    } else {
      lastImage.style.maxWidth = width;
    }
    
    lastImage.style.height = 'auto';
    lastImage.style.display = 'block';
    lastImage.style.margin = '10px auto';
  }

  return (
    <Card padding={4}>
      <Stack space={4}>
        <Text size={2} weight="bold">Rich Text Editor (TipTap)</Text>
        
        <Text size={1} style={{ backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
          💡 <strong>How to use:</strong> Select text first, then click formatting buttons. Add images by URL or file upload. Resize images using the size buttons.
        </Text>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => editor && editor.chain().focus().toggleBold().run()} disabled={!editor}>Bold</button>
          <button onClick={() => editor && editor.chain().focus().toggleItalic().run()} disabled={!editor}>Italic</button>
          <button onClick={() => editor && editor.chain().focus().toggleSuperscript().run()} disabled={!editor}>Superscript</button>
          <button onClick={() => editor && editor.chain().focus().toggleSubscript().run()} disabled={!editor}>Subscript</button>
          
          <span style={{ margin: '0 8px' }}>|</span>
          
          <button onClick={() => editor && editor.chain().focus().setColor('#ff0000').run()} disabled={!editor}>Red</button>
          <button onClick={() => editor && editor.chain().focus().setColor('#0000ff').run()} disabled={!editor}>Blue</button>
          <button onClick={() => editor && editor.chain().focus().setColor('#00ff00').run()} disabled={!editor}>Green</button>
          <button onClick={() => editor && editor.chain().focus().setColor('#000000').run()} disabled={!editor}>Black</button>
          
          <input 
            type="color" 
            value={customColor} 
            onChange={(e) => setCustomColor(e.target.value)}
            style={{ width: '40px', height: '30px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            title="Choose a custom color"
          />
          <button onClick={applyCustomColor} disabled={!editor} style={{ fontWeight: 'bold' }}>Apply Color</button>
          
          <span style={{ margin: '0 8px' }}>|</span>
          
          <button onClick={() => editor && editor.chain().focus().setTextAlign('left').run()} disabled={!editor}>Left</button>
          <button onClick={() => editor && editor.chain().focus().setTextAlign('center').run()} disabled={!editor}>Center</button>
          <button onClick={() => editor && editor.chain().focus().setTextAlign('right').run()} disabled={!editor}>Right</button>
        </div>
        
        {/* Image Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#f8f8f8', padding: '8px', borderRadius: '4px' }}>
          <Text size={1} weight="bold">Images:</Text>
          
          <input 
            type="text" 
            placeholder="Image URL" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}
          />
          <button onClick={addImageByUrl} disabled={!editor || !imageUrl}>Add Image URL</button>
          
          <span style={{ margin: '0 8px' }}>or</span>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={addImageByFile}
            style={{ fontSize: '12px' }}
          />
        </div>
        
        {/* Image Resize Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#e8f4fd', padding: '8px', borderRadius: '4px' }}>
          <Text size={1} weight="bold">Resize Last Image:</Text>
          
          <button onClick={() => resizeImage('200px')} disabled={!editor}>Small (200px)</button>
          <button onClick={() => resizeImage('400px')} disabled={!editor}>Medium (400px)</button>
          <button onClick={() => resizeImage('600px')} disabled={!editor}>Large (600px)</button>
          <button onClick={() => resizeImage('100%')} disabled={!editor}>Full Width</button>
          
          <span style={{ margin: '0 8px' }}>|</span>
          
          <input 
            type="number" 
            placeholder="Custom width (px)" 
            value={customWidth} 
            onChange={(e) => setCustomWidth(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', width: '120px' }}
          />
          <button onClick={() => resizeImage('custom')} disabled={!editor || !customWidth}>Apply Custom</button>
        </div>
        
        <EditorContent editor={editor} style={{ border: '1px solid #ccc', minHeight: 200, padding: 8, borderRadius: 4 }} />
        
        <Button text={saved ? "Copied!" : "Copy HTML to Clipboard"} tone="primary" onClick={saveContent} disabled={!editor} />
        
        <Text size={1} muted>
          <strong>Steps:</strong> 1) Write & format text → 2) Add images → 3) Resize images → 4) Copy HTML → 5) Paste into your blog post
        </Text>
      </Stack>
    </Card>
  )
} 