export async function getServerSideProps({ res }) {
  const baseUrl = "https://Niinfomed.com";

  const data = await fetch(`${process.env.CMS_API_URL}/api/images`).then(r => r.json());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${data.map(item => `
  <url>
    <loc>${baseUrl}${item.page_url}</loc>
    ${item.images.map(img => `
      <image:image>
        <image:loc>${img}</image:loc>
      </image:image>
    `).join("")}
  </url>
`).join("")}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function ImageSitemap() {
  return null;
}
