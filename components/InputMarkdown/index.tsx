import React, { useCallback, useState } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import { CustomToolbar } from "./CustomToolbar";

export const InputMarkdown = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [val, setVal] = useState(initialValue);

  const renderElement = useCallback(props => {
    return <Element {...props} />;
  }, []);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />;
  }, []);

  // console.log("VAL", val);

  return (
    <Slate editor={editor} value={initialValue} onChange={(value: Descendant[]) => setVal(value)}>
      <CustomToolbar />
      <Editable
        // onClick={onClick}
        // onDrop={onDrop}
        // onDragStart={onDragStart}
        placeholder="Write something"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }]
  }
];

const Element = (props: any) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "headingOne":
      return <h1 {...attributes}>{children}</h1>;

    default:
      return <p {...attributes}>{children}</p>;
  }
};
const Leaf = ({ attributes, children, leaf }: any) => {
  // console.log({ attributes, children, leaf });

  if (leaf.bold) {
    children = <span {...attributes}>{children}</span>;
  }

  return <span {...attributes}>{children}</span>;
};
