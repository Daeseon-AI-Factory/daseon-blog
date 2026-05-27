import siteJson from "@/content/site.json";

export type SitePhoto = { url: string; alt: string };

export type SiteAuthor = {
  name: string;
  nameKo: string;
  role: string;
  roleKo: string;
  location: string;
  locationKo: string;
  email: string;
  avatar: string;
  available: boolean;
  github: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  handle: string;
  hobby: string;
  hobbyKo: string;
  hobbyPhotos: SitePhoto[];
};

const author = siteJson as SiteAuthor;

export const SITE = {
  name: author.name,
  domain: "daeseon.ai",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://daeseon.ai",
  author,
};
