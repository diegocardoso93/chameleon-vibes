import { PageContextServer } from "vike/types";

export type ServerPageProps = PageContextServer & {
  pageData: {},
};

export type IntervalRef = NodeJS.Timeout;
