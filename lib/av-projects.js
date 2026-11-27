/**
 * Fuente única de verdad para el Portafolio Digital (trabajos de edición
 * audiovisual y contenido digital). Los videos están alojados en Google
 * Drive; aquí solo se registran los metadatos y los enlaces públicos
 * provistos. NO se inventan descripciones específicas, duración,
 * software utilizado ni resultados.
 *
 * 4 categorías (Zinclair Espacio de Arte, Gaceta Play, ADVAP, Reels y
 * TikTok) + 12 videos (selección del cierre v1.0, editable).
 *
 * Miniaturas: son thumbnails reales de Google Drive, descargados una sola
 * vez a /public/av-thumbnails/ porque el hotlink directo desde lh3 puede
 * ser bloqueado por el navegador (ERR_BLOCKED_BY_ORB). Servirlas localmente
 * es la forma confiable de mostrarlas sin tocar los videos.
 *
 * En los tres videos de Zinclair, el thumbnail automático de Drive es el
 * primer fotograma (negro). Para que las tarjetas no parezcan vacías se
 * capturó un fotograma representativo del preview público (a 2–8 s) y se
 * guardó como JPEG local; no se descargó ni migró ningún video completo.
 *
 * Los títulos que describen contenido (ADVAP) se basan en texto visible en
 * la propia miniatura; los que no se pudieron verificar conservan el
 * nombre original del archivo de Drive.
 *
 * FORMATO: todas las tarjetas usan un contenedor único de 9:16 (ver
 * AvProjectCard), con `object-fit: contain` sobre un fondo desenfocado de
 * la propia miniatura. La proporción original de cada pieza se respeta al
 * reproducir (el preview de Google Drive la conserva), por lo que aquí ya
 * no se guarda un `aspectRatio` por proyecto.
 *
 * SELECCIÓN v1.0:
 *  - Gaceta Play: c16 (pieza obligatoria del propietario) + c48 + c43,
 *    tomados de la carpeta raíz de la marca (trabajos recientes).
 *  - Reels y TikTok: "Coker habla de Duki" (archivo `duki habla de YSYA.mp4`,
 *    identificado por el propietario) + Free Duko + No me alcanza - Duki.
 *  - Zinclair Espacio de Arte y ADVAP: se mantienen los videos iniciales.
 */

export const AV_CATEGORIES = [
  {
    id: "espacio-zinclair",
    name: "Zinclair Espacio de Arte",
    folderUrl:
      "https://drive.google.com/drive/folders/1JEe9GcC70UbXL0rEGFWYTPE-fGQQoX-r",
  },
  {
    id: "gaceta-play",
    name: "Gaceta Play",
    folderUrl:
      "https://drive.google.com/drive/folders/1pwz5JA2nK3_S7DtNkckjmacfXrT7qVa8",
  },
  {
    id: "advap",
    name: "ADVAP",
    folderUrl:
      "https://drive.google.com/drive/folders/1XLtsd5F8A4BJzkiriFZKrZDjXdnpZI1H",
  },
  {
    id: "reales-y-tiktok",
    name: "Reels y TikTok",
    folderUrl:
      "https://drive.google.com/drive/folders/19p2LoZDM_xdz5CWVlDY-oWj7wB6KTHYU",
  },
];

export const AV_PROJECTS = [
  // --- Zinclair Espacio de Arte ---
  {
    id: "zinclair-reel-talleres",
    categoryId: "espacio-zinclair",
    title: "Reel final — Talleres",
    videoUrl:
      "https://drive.google.com/file/d/1WkarnqylaR3YwwnH3aP3oW4vlYImAm7n/view",
    thumbnailUrl:
      "/av-thumbnails/zinclair-reel-talleres.jpg",
  },
  {
    id: "zinclair-presentacion-web-2025",
    categoryId: "espacio-zinclair",
    title: "Presentación página web 2025",
    videoUrl:
      "https://drive.google.com/file/d/14acjizQfTRZlLZtIEeI8iZqdzWygMvHr/view",
    thumbnailUrl:
      "/av-thumbnails/zinclair-presentacion-web-2025.jpg",
  },
  {
    id: "zinclair-arte-2024",
    categoryId: "espacio-zinclair",
    title: "Zinclair Espacio de Arte 2024",
    videoUrl:
      "https://drive.google.com/file/d/1dKScNz6H15oDxKeWTkvNnTPnWbyjAdsk/view",
    thumbnailUrl:
      "/av-thumbnails/zinclair-arte-2024.jpg",
  },
  // --- Gaceta Play (c16 obligatorio + c48 + c43) ---
  {
    id: "gaceta-play-c16",
    categoryId: "gaceta-play",
    title: "Video C16",
    videoUrl:
      "https://drive.google.com/file/d/1XMagIRXoq7KC5A3l8uykP2Cp1y0xgsIl/view",
    thumbnailUrl:
      "/av-thumbnails/gaceta-play-c16.jpg",
  },
  {
    id: "gaceta-play-c48",
    categoryId: "gaceta-play",
    title: "Video C48",
    videoUrl:
      "https://drive.google.com/file/d/1zI2Dai9nx--y5cNmEivQAQxXHw7ern_C/view",
    thumbnailUrl:
      "/av-thumbnails/gaceta-play-c48.jpg",
  },
  {
    id: "gaceta-play-c43",
    categoryId: "gaceta-play",
    title: "Video C43",
    videoUrl:
      "https://drive.google.com/file/d/1Yr9xJJM7O5xTHcuMh-WntSmjRK8km4RY/view",
    thumbnailUrl:
      "/av-thumbnails/gaceta-play-c43.jpg",
  },
  // --- ADVAP ---
  {
    id: "advap-octavio-milon",
    categoryId: "advap",
    title: "Octavio Milon — A dónde vamos a parar",
    videoUrl:
      "https://drive.google.com/file/d/1lutBT1SlPMLSDd4rr0aSW-gWX0c9Y6lZ/view",
    thumbnailUrl:
      "/av-thumbnails/advap-octavio-milon.jpg",
  },
  {
    id: "advap-candidatas-concejal-pinamar",
    categoryId: "advap",
    title: "Candidatas a concejal — Pinamar",
    videoUrl:
      "https://drive.google.com/file/d/11RHkYAhOTxQJcai_z1q_Seq12_C4bL7y/view",
    thumbnailUrl:
      "/av-thumbnails/advap-candidatas-concejal-pinamar.jpg",
  },
  {
    id: "advap-radio-perio",
    categoryId: "advap",
    title: "Radio Perio — Entrevista",
    videoUrl:
      "https://drive.google.com/file/d/13FBQhFVUe4Efskxyqh-iUyelowehYIGy/view",
    thumbnailUrl:
      "/av-thumbnails/advap-radio-perio.jpg",
  },
  // --- Reels y TikTok ---
  {
    id: "reales-coker-habla-de-duki",
    categoryId: "reales-y-tiktok",
    title: "Coker habla de Duki",
    videoUrl:
      "https://drive.google.com/file/d/11ZkH-HLhK9ZdUT2P02AgZZookVxPPryU/view",
    thumbnailUrl:
      "/av-thumbnails/reales-coker-habla-de-duki.jpg",
  },
  {
    id: "reales-free-duko",
    categoryId: "reales-y-tiktok",
    title: "Free Duko",
    videoUrl:
      "https://drive.google.com/file/d/1JWlshIXLkM1fklnssQRYhDBaGGCtMtEc/view",
    thumbnailUrl:
      "/av-thumbnails/reales-free-duko.jpg",
  },
  {
    id: "reales-no-me-alcanza-duki",
    categoryId: "reales-y-tiktok",
    title: "No me alcanza - Duki",
    videoUrl:
      "https://drive.google.com/file/d/12tYybVNTn1t3VxqF-1P5H8KGX5VeuIW3/view",
    thumbnailUrl:
      "/av-thumbnails/reales-no-me-alcanza-duki.jpg",
  },
];
