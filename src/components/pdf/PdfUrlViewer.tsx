import pdfjs from "pdfjs-dist";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef,useState } from "react";

import PdfViewer from "./PdfViewer";

const PdfUrlViewer = (props: any) => {
  const { url, ...others } = props;

  const pdfRef: any = useRef();

  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    var loadingTask = pdfjs.getDocument(url);
    loadingTask.promise.then(
      (pdf: any) => {
        pdfRef.current = pdf;

        setItemCount(pdf._pdfInfo.numPages);

        // Fetch the first page
        var pageNumber = 1;
        pdf.getPage(pageNumber).then(function () {});
      },
      (reason: any) => {
        // PDF loading error
        console.error(reason);
      }
    );
  }, [url]);

  const handleGetPdfPage = useCallback((index: any) => {
    return pdfRef.current.getPage(index + 1);
  }, []);

  return <PdfViewer {...others} itemCount={itemCount} getPdfPage={handleGetPdfPage} />;
};

PdfUrlViewer.propTypes = {
  url: PropTypes.string.isRequired,
};

export default PdfUrlViewer;
