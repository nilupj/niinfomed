import axios from 'axios';
import { mapBackendUrlToFrontend } from './routeMapper';

const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL || 'http://127.0.0.1:8001';

const pageCache = new Map();

export async function resolveWagtailPageUrl(id) {
  if (!id) return '#';
  if (pageCache.has(id)) return pageCache.get(id);

  try {
    const res = await axios.get(`${CMS_API_URL}/api/v2/pages/${id}/`);
    const backendUrl = res.data?.meta?.url;

    const frontendUrl = mapBackendUrlToFrontend(backendUrl);

    pageCache.set(id, frontendUrl);

    return frontendUrl;
  } catch (err) {
    console.error('Link resolve failed:', id);
    return '#';
  }
}
