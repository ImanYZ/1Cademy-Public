import { DispatchNodeBookActions, NodeBookState } from "../../nodeBookTypes";

export const INITIAL_STATE: NodeBookState = {
  sNode: null,
  isSubmitting: false,
  choosingNode: null,
  chosenNode: null,
  selectedNode: null,
  selectionType: null,
  selectedTags: [],
  openToolbar: false,
  selectedUser: null,
  searchQuery: "",
  nodeTitleBlured: false,
};

function nodeBookReducer(state: NodeBookState, action: DispatchNodeBookActions): NodeBookState {
  switch (action.type) {
    case "setSNode":
      return { ...state, sNode: action.payload };
    case "setIsSubmitting":
      return { ...state, isSubmitting: action.payload };
    case "setChoosingNode":
      return { ...state, choosingNode: action.payload };
    case "setChosenNode":
      return { ...state, chosenNode: action.payload };
    case "setSelectedNode":
      return { ...state, selectedNode: action.payload };
    case "setSelectionType":
      return { ...state, selectionType: action.payload };
    case "setSelectedTags":
      return { ...state, selectedTags: action.payload };
    case "setOpenToolbar":
      return { ...state, openToolbar: action.payload };
    case "setSelectedUser":
      return { ...state, selectedUser: action.payload };
    case "setSearchQuery":
      return { ...state, searchQuery: action.payload };
    case "setNodeTitleBlured":
      return { ...state, nodeTitleBlured: action.payload };
    default:
      return { ...state };
  }
}

export default nodeBookReducer;
