import type { Site } from "@/types/site";
import { mockSites } from "@/mocks/data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let sites: Site[] = [...mockSites];

export async function listSites(): Promise<Site[]> {
  await delay();
  return [...sites];
}

export async function createSite(site: Site): Promise<Site> {
  await delay();
  sites = [...sites, site];
  return site;
}

export async function updateSite(site: Site): Promise<Site> {
  await delay();
  sites = sites.map((s) => (s.site_id === site.site_id ? site : s));
  return site;
}

export async function deleteSite(siteId: string): Promise<void> {
  await delay();
  sites = sites.filter((s) => s.site_id !== siteId);
}