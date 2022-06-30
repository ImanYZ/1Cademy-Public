import { BaseEditor, Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";

export type TextEditorOptions = "bold";

export const toggleMark = (editor: BaseEditor & ReactEditor, format: TextEditorOptions) => {
  // Editor.addMark(editor, format, true);
  console.log("Editor", editor, editor.getFragment());

  const textSelected = editor.getFragment()[0].children[0].text;
  const marks = Editor.marks(editor);
  console.log("MARKS", marks);
  const hasMark = marks ? marks[format] === true : false;

  if (!hasMark) {
    console.log(1);
    if (!textSelected) {
      console.log(2);
      Editor.addMark(editor, format, true);
      Editor.insertNode(editor, [{ text: "** **" }]);
    } else {
      console.log(3);
      Editor.addMark(editor, format, true);
      // const in = Inline
      // Editor.insertNode(editor, [{ type: 'quote', children: [{ text: `**${textSelected}**` }] }])
      Editor.insertText(editor, `**${textSelected}**`);
    }
  } else {
    console.log("a");
    if (!textSelected) {
      const [selectedNode, path] = Editor.node(editor, editor.selection?.anchor || [0]);
      const textFromCurrentNode = selectedNode.text;
      console.log("b", selectedNode);
      Editor.removeMark(editor, format);
      // Editor.deleteBackward(editor, { unit: 'character' })
      Transforms.setNodes(editor, [{ text: textFromCurrentNode }], { at: path });
      // Editor.deleteForward(editor, { unit: 'character' })
    }
  }

  ReactEditor.focus(editor);
};

export default { toggleMark };
