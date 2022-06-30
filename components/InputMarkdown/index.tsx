import React, { useCallback, useState } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";

import { CustomToolbar } from "./CustomToolbar";

export const InputMarkdown = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [val, setVal] = useState(initialValue);

  // const rr = useSelected()
  // const editorSlate = useSlate();

  // const onClick = event => {
  //   // Implement custom event logic...

  //   // When no value is returned, Slate will execute its own event handler when
  //   // neither isDefaultPrevented nor isPropagationStopped was set on the event
  // };

  // const onDrop = event => {
  //   // Implement custom event logic...

  //   // No matter the state of the event, treat it as being handled by returning
  //   // true here, Slate will skip its own event handler
  //   return true;
  // };

  // const onDragStart = event => {
  //   // Implement custom event logic...

  //   // No matter the status of the event, treat event as *not* being handled by
  //   // returning false, Slate will execute its own event handler afterward
  //   return false;
  // };

  const renderElement = useCallback(props => {
    // console.log('renderElement', props)
    return <Element {...props} />;
  }, []);

  const renderLeaf = useCallback(props => {
    // console.log('renderLeaf', props)
    return <Leaf {...props} />;
  }, []);

  console.log("VAL", val);

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

  // return (
  //   <Slate editor={editor} value={initialValue} >
  //     <Toolbar variant="dense">
  //       <IconButton
  //         aria-label="menu"
  //         onClick={onClick}
  //       >
  //         <FormatBoldIcon />
  //       </IconButton>
  //       {/* <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={onSelect}>
  //         <FormatBoldIcon />
  //       </IconButton> */}
  //     </Toolbar>
  //     <Editable
  //       renderElement={renderElement}
  //       renderLeaf={renderLeaf}
  //       onKeyDown={event => {
  //         if (event.key === "&") {
  //           // Prevent the ampersand character from being inserted.
  //           event.preventDefault();
  //           // Execute the `insertText` method when the event occurs.
  //           editor.insertText("and");
  //         }
  //       }}
  //     />
  //   </Slate>
  // )
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }]
  }
];

const Element = props => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "headingOne":
      return <h1 {...attributes}>{children}</h1>;
    // case 'headingTwo':
    //   return <h2 {...attributes}>{children}</h2>
    // case 'headingThree':
    //   return <h3 {...attributes}>{children}</h3>
    // case 'blockquote':
    //   return <blockquote {...attributes}>{children}</blockquote>
    // case 'alignLeft':
    //   return <div style={{ textAlign: 'left', listStylePosition: 'inside' }} {...attributes}>{children}</div>
    // case 'alignCenter':
    //   return <div style={{ textAlign: 'center', listStylePosition: 'inside' }} {...attributes}>{children}</div>
    // case 'alignRight':
    //   return <div style={{ textAlign: 'right', listStylePosition: 'inside' }} {...attributes}>{children}</div>
    // case 'list-item':
    //   return <li {...attributes}>{children}</li>
    // case 'orderedList':
    //   return <ol type='1' {...attributes}>{children}</ol>
    // case 'unorderedList':
    //   return <ul {...attributes}>{children}</ul>
    // case 'link':
    //   return <Link {...props} />

    // case 'table':
    //   return <table>
    //     <tbody {...attributes}>{children}</tbody>
    //   </table>
    // case 'table-row':
    //   return <tr {...attributes}>{children}</tr>
    // case 'table-cell':
    //   return <td {...attributes}>{children}</td>
    // case 'image':
    //   return <Image {...props} />
    // case 'video':
    //   return <Video {...props} />
    default:
      return <p {...attributes}>{children}</p>;
  }
};
const Leaf = ({ attributes, children, leaf }) => {
  console.log({ attributes, children, leaf });

  if (leaf.bold) {
    children = <span {...attributes}>{children}</span>;
  }

  // if (leaf.code) {
  //   children = <code>{children}</code>
  // }

  // if (leaf.italic) {
  //   children = <em>{children}</em>
  // }
  // if (leaf.strikethrough) {
  //   children = <span style={{ textDecoration: 'line-through' }}>{children}</span>
  // }
  // if (leaf.underline) {
  //   children = <u>{children}</u>
  // }
  // if (leaf.superscript) {
  //   children = <sup>{children}</sup>
  // }
  // if (leaf.subscript) {
  //   children = <sub>{children}</sub>
  // }
  // if (leaf.color) {
  //   children = <span style={{ color: leaf.color }}>{children}</span>
  // }
  // if (leaf.bgColor) {
  //   children = <span style={{ backgroundColor: leaf.bgColor }}>{children}</span>
  // }
  // if (leaf.fontSize) {
  //   const size = sizeMap[leaf.fontSize]
  //   children = <span style={{ fontSize: size }}>{children}</span>
  // }
  // if (leaf.fontFamily) {
  //   const family = fontFamilyMap[leaf.fontFamily]
  //   children = <span style={{ fontFamily: family }}>{children}</span>
  // }
  return <span {...attributes}>{children}</span>;
};
