export const convertToTGet = (query: any, t: any) => {
  if (t) {
    return t.get(query);
  }
  return query.get();
};
