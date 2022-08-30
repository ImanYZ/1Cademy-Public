import httpMocks from "node-mocks-http";

const createPostReq = (body: any) => {
  const req = httpMocks.createRequest({
    method: "POST",
    body,
  });

  const res = httpMocks.createResponse();
  return { req: req as any, res: res as any };
};

export default createPostReq;
