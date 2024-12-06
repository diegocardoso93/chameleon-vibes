// https://vike.dev/data

import { ServerPageProps } from "../../common/types";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = async (pageContext: ServerPageProps) => {
  return pageContext.pageData;
}
