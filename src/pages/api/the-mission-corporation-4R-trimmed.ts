import fs from "fs";
const filename = "/the-mission-corporation-4R-trimmed.html";
export default async function api(req: any, res: any) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.write(await fs.readFileSync(filename, "utf-8"));
  res.end();
}
