import ReactDOM from "react-dom";

export const Portal = ({ anchor, children }: { anchor: string; children: ReactNode }) => {
  const el = document.getElementById(anchor);

  if (!el) return null;

  return ReactDOM.createPortal(children, el);
};
