import React from 'react'
import {PortableTextInput, PortableTextInputProps} from 'sanity'

// Simple SVG icons for superscript and subscript
const SuperscriptSvg = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="1" y="13" fontSize="10" fontFamily="Arial">x</text><text x="10" y="7" fontSize="7" fontFamily="Arial">2</text></svg>
)
const SubscriptSvg = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="1" y="13" fontSize="10" fontFamily="Arial">x</text><text x="10" y="17" fontSize="7" fontFamily="Arial">2</text></svg>
)

function CustomToolbarActions(props: any) {
  const {editor} = props;
  if (!editor) return null;
  return (
    <>
      <button
        type="button"
        title="Superscript"
        onClick={() => editor.toggleMark('sup')}
        style={{marginRight: 4}}
      >
        <SuperscriptSvg />
      </button>
      <button
        type="button"
        title="Subscript"
        onClick={() => editor.toggleMark('sub')}
      >
        <SubscriptSvg />
      </button>
    </>
  );
}

export default function CustomPortableTextEditor(props: PortableTextInputProps) {
  return (
    <PortableTextInput
      {...props}
      renderBlockActions={CustomToolbarActions}
    />
  );
} 