import { createContext, Dispatch, FC, ReactNode, useContext, useReducer } from "react";

import nodeBookReducer, { INITIAL_STATE } from "../lib/reducers/nodeBook";
import { DispatchNodeBookActions, NodeBookState } from "../nodeBookTypes";

const NodeBookContext = createContext<{
  state: NodeBookState,
  dispatch: Dispatch<DispatchNodeBookActions>
} | undefined>(undefined);

type Props = {
  children: ReactNode;
  store?: NodeBookState;
};

const NodeBookProvider: FC<Props> = ({ children, store }) => {
  const [state, dispatch] = useReducer(nodeBookReducer, store || INITIAL_STATE);

  return (
    <NodeBookContext.Provider value={{ state, dispatch }}>
      {children}
    </NodeBookContext.Provider>
  );
};

function useNodeBook() {
  const context = useContext(NodeBookContext);
  if (!context) throw new Error("NodeBookContext must be used within a NodeBookProvider")

  return { nodeBookState: context.state, nodeBookDispatch: context.dispatch };
}

export { NodeBookProvider, useNodeBook };
