import React, { useRef,useState } from "react";

import PdfUrlViewer from "../components/pdf/PdfUrlViewer";

const Books = () => {
  const [scale, setScale] = useState<any>(1);
  const [page, setPage] = useState(1);
  const windowRef: any = useRef();
  const url = "the_mission_corporation_4R_trimmed.pdf";

  const scrollToItem = () => {
    windowRef.current && windowRef.current.scrollToItem(page - 1, "start");
  };

  return (
    <div>
      <h1>Pdf Viewer</h1>
      <div>
        <input value={page} onChange={(e: any) => setPage(e.target.value)} />
        <button type="button" onClick={scrollToItem}>
          goto
        </button>
        Zoom
        <button type="button" onClick={() => setScale((v: any) => v + 0.1)}>
          +
        </button>
        <button type="button" onClick={() => setScale((v: any) => v - 0.1)}>
          -
        </button>
      </div>
      <br />
      <PdfUrlViewer url={url} scale={scale} windowRef={windowRef} />
      <p>https://mozilla.github.io/pdf.js/examples/index.html#interactive-examples</p>
      <p>https://react-window.now.sh/#/examples/list/variable-size</p>
    </div>
  );
};

export default Books;
