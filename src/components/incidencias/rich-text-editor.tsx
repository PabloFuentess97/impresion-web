"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  valor: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/** Botón de la barra de herramientas del editor. */
function ToolbarButton({
  onClick,
  activo,
  disabled,
  titulo,
  children,
}: {
  onClick: () => void;
  activo?: boolean;
  disabled?: boolean;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={titulo}
      aria-label={titulo}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40 [&_svg]:h-4 [&_svg]:w-4",
        activo
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const anadirEnlace = React.useCallback(() => {
    const previo = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Introduce la URL del enlace:", previo ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const anadirImagen = React.useCallback(() => {
    const url = window.prompt("Introduce la URL de la imagen:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1.5">
      <ToolbarButton
        titulo="Negrita"
        onClick={() => editor.chain().focus().toggleBold().run()}
        activo={editor.isActive("bold")}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        titulo="Cursiva"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        activo={editor.isActive("italic")}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        titulo="Tachado"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        activo={editor.isActive("strike")}
      >
        <Strikethrough />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        titulo="Encabezado 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        activo={editor.isActive("heading", { level: 1 })}
      >
        <Heading1 />
      </ToolbarButton>
      <ToolbarButton
        titulo="Encabezado 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        activo={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 />
      </ToolbarButton>
      <ToolbarButton
        titulo="Encabezado 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        activo={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        titulo="Lista con viñetas"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        activo={editor.isActive("bulletList")}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        titulo="Lista numerada"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        activo={editor.isActive("orderedList")}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        titulo="Cita"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        activo={editor.isActive("blockquote")}
      >
        <Quote />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton titulo="Enlace" onClick={anadirEnlace} activo={editor.isActive("link")}>
        <LinkIcon />
      </ToolbarButton>
      <ToolbarButton titulo="Imagen" onClick={anadirImagen}>
        <ImageIcon />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        titulo="Deshacer"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo />
      </ToolbarButton>
      <ToolbarButton
        titulo="Rehacer"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo />
      </ToolbarButton>
    </div>
  );
}

/** Editor de texto enriquecido (WYSIWYG) basado en Tiptap. */
export function RichTextEditor({
  valor,
  onChange,
  placeholder = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: valor,
    editorProps: {
      attributes: {
        class: "tiptap prosa max-w-none px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sincroniza si el valor externo cambia (p. ej. al abrir en modo edición).
  React.useEffect(() => {
    if (editor && valor !== editor.getHTML()) {
      editor.commands.setContent(valor, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="h-[280px] animate-pulse rounded-lg border border-border bg-muted/40" />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="max-h-[400px] overflow-y-auto scrollbar-thin" />
    </div>
  );
}
