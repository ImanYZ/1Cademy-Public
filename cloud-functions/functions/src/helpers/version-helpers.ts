type Ilinks = {
  node: string;
};
export const compareChoices = ({ node1, node2 }: any) => {
  if (!("choices" in node1) && !("choices" in node2)) {
    return true;
  }
  if (("choices" in node1 && !("choices" in node2)) || (!("choices" in node1) && "choices" in node2)) {
    return false;
  }
  if (node1.choices.length !== node2.choices.length) {
    return false;
  }
  for (let i = 0; i < node1.choices.length; i++) {
    if (
      node1.choices[i].choice !== node2.choices[i].choice ||
      node1.choices[i].correct !== node2.choices[i].correct ||
      node1.choices[i].feedback !== node2.choices[i].feedback
    ) {
      return false;
    }
  }
  return true;
};

export const compareFlatLinks = ({ links1, links2 }: any) => {
  if (typeof links2 === "undefined" && typeof links1 !== "undefined") {
    return false;
  }
  if (links1.length !== links2.length) {
    return false;
  }
  for (let i = 0; i < links1.length; i++) {
    if (links1[i] !== links2[i]) {
      return false;
    }
  }
  return true;
};

export const compareLinks = ({ oldLinks, newLinks }: { oldLinks: Ilinks[]; newLinks: Ilinks[] }) => {
  const addedLinks = newLinks.filter(newLink => !oldLinks.some(oldLink => oldLink.node === newLink.node));
  const removedLinks = oldLinks.filter(oldLink => !newLinks.some(newLink => newLink.node === oldLink.node));
  return { addedLinks, removedLinks };
};

export const checkNeedsUpdates = ({ previousValue, newValue }: any) => {
  const parentCompare = compareLinks({ oldLinks: previousValue.parents, newLinks: newValue.parents });
  const childCompare = compareLinks({ oldLinks: previousValue.children, newLinks: newValue.children });
  if (previousValue.title !== newValue.title) {
    return true;
  }
  if (previousValue.content !== newValue.content) {
    return true;
  }
  if (previousValue.nodeImage !== "" && newValue.nodeImage === "") {
    return true;
  } else if (previousValue.nodeImage === "" && newValue.nodeImage !== "") {
    return true;
  } else if (previousValue.nodeImage !== newValue.nodeImage) {
    return true;
  }
  if (previousValue.nodeVideo !== "" && newValue.nodeVideo === "") {
    return true;
  } else if (previousValue.nodeVideo === "" && newValue.nodeVideo !== "") {
    return true;
  } else if (previousValue.nodeVideo !== newValue.nodeVideo) {
    return true;
  }
  if (previousValue.nodeAudio !== "" && newValue.nodeAudio === "") {
    return true;
  } else if (previousValue.nodeAudio === "" && newValue.nodeAudio !== "") {
    return true;
  } else if (previousValue.nodeAudio !== newValue.nodeAudio) {
    return true;
  }
  if (previousValue.referenceIds.length > newValue.referenceIds.length) {
    return true;
  } else if (previousValue.referenceIds.length < newValue.referenceIds.length) {
    return true;
  }
  if (
    !compareFlatLinks({ links1: previousValue.referenceIds, links2: newValue.referenceIds }) ||
    !compareFlatLinks({ links1: previousValue.referenceLabels, links2: newValue.referenceLabels })
  ) {
    return true;
  }
  if (previousValue.tagIds.length > newValue.tagIds.length) {
    return true;
  } else if (previousValue.tagIds.length < newValue.tagIds.length) {
    return true;
  }
  if (!compareFlatLinks({ links1: previousValue.tagIds, links2: newValue.tagIds })) {
    return true;
  }
  if (
    parentCompare.addedLinks.length > 0 ||
    childCompare.addedLinks.length > 0 ||
    parentCompare.removedLinks.length > 0 ||
    childCompare.removedLinks.length > 0
  ) {
    return true;
  }
  return false;
};
