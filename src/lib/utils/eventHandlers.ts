export const preventEventPropagation = (event) => {
  event.preventDefault();
  event.stopPropagation();
};
