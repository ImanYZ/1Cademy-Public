import { v4 as uuidv4 } from "uuid";

export default function (prefix = "id") {
  return uuidv4();
}
