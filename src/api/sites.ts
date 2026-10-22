import type { Site, SiteVersion } from "@/types/site";
import { mockSites } from "@/mocks/data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let sites: Site[] = [...mockSites];

let versions: SiteVersion[] = mockSites.map((s) => ({
  site_id: s.site_id,
  version: 1,
  snapshot: s,
  note: "Bản ban đầu",
  created_at: s.updated_at,
}));

const nextVersion = (siteId: string) =>
  Math.max(0, ...versions.filter((v) => v.site_id === siteId).map((v) => v.version)) + 1;

export async function listSites(): Promise<Site[]> {
  await delay();
  return [...sites];
}

export async function createSite(site: Site): Promise<Site> {
  await delay();
  sites = [...sites, site];
  versions = [
    ...versions,
    { site_id: site.site_id, version: 1, snapshot: site, note: "Tạo mới", created_at: site.updated_at },
  ];
  return site;
}

export async function updateSite(site: Site): Promise<Site> {
  await delay();
  sites = sites.map((s) => (s.site_id === site.site_id ? site : s));
  versions = [
    ...versions,
    {
      site_id: site.site_id,
      version: nextVersion(site.site_id),
      snapshot: site,
      note: "Sửa",
      created_at: site.updated_at,
    },
  ];
  return site;
}

export async function deleteSite(siteId: string): Promise<void> {
  await delay();
  sites = sites.filter((s) => s.site_id !== siteId);
  versions = versions.filter((v) => v.site_id !== siteId);
}

export async function listSiteVersions(siteId: string): Promise<SiteVersion[]> {
  await delay(200);
  return versions.filter((v) => v.site_id === siteId).sort((a, b) => b.version - a.version);
}

export async function rollbackSite(siteId: string, toVersion: number): Promise<Site> {
  await delay();
  const target = versions.find((v) => v.site_id === siteId && v.version === toVersion);
  if (!target) throw new Error("Không tìm thấy phiên bản");
  const now = new Date().toISOString();
  const restored: Site = { ...target.snapshot, updated_at: now };
  sites = sites.map((s) => (s.site_id === siteId ? restored : s));
  versions = [
    ...versions,
    {
      site_id: siteId,
      version: nextVersion(siteId),
      snapshot: restored,
      note: `Rollback về v${toVersion}`,
      created_at: now,
    },
  ];
  return restored;
}