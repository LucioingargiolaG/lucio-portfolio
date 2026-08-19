export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap: "https://lucio-portfolio-theta.vercel.app/sitemap.xml",
  };
}
