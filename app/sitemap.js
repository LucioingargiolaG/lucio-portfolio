export default function sitemap() {
  return [
    {
      url: "https://lucio-portfolio-theta.vercel.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://lucio-portfolio-theta.vercel.app/projects",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://lucio-portfolio-theta.vercel.app/portfolio-digital",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
