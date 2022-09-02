export const preventEventPropagation = (event: any) => {
  event.preventDefault();
  event.stopPropagation();
};
