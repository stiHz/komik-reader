import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const OWNER = "stiHz";
const REPO = "komik-reader";
const DATA_PATH = "data/manga";

function checkAuth(request: NextRequest): boolean {
  const password = request.nextUrl.searchParams.get("pw") || "";
  return password === ADMIN_PASSWORD;
}

async function githubApi(endpoint: string, method: string = "GET", body?: object) {
  const url = `https://api.github.com${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  return res.json();
}

// GET /api/admin/manga?pw=xxx&slug=xxx
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");

  if (slug) {
    // Get single manga
    const data = await githubApi(
      `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}/${slug}.json`
    );
    if (data.content) {
      const content = JSON.parse(Buffer.from(data.content, "base64").toString());
      return NextResponse.json({ ...content, _sha: data.sha });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // List all manga slugs
  const data = await githubApi(
    `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`
  );
  if (Array.isArray(data)) {
    const slugs = data
      .filter((f: any) => f.name.endsWith(".json"))
      .map((f: any) => f.name.replace(".json", ""));
    return NextResponse.json(slugs);
  }
  return NextResponse.json([]);
}

// POST /api/admin/manga?pw=xxx - Create new manga
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, title, cover, author, status, type, synopsis, genres, releaseYear, rating, alternativeTitle } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: "slug dan title wajib" }, { status: 400 });
    }

    // Check if file already exists
    const existing = await githubApi(
      `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}/${slug}.json`
    );
    if (existing.content) {
      return NextResponse.json({ error: "Manga sudah ada" }, { status: 409 });
    }

    const mangaData = {
      slug,
      title,
      alternativeTitle: alternativeTitle || "",
      cover: cover || "",
      author: author || "Unknown",
      artist: body.artist || "",
      status: status || "ongoing",
      type: type || "manga",
      synopsis: synopsis || "",
      genres: genres || [],
      releaseYear: releaseYear || new Date().getFullYear(),
      rating: rating || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: [],
    };

    const content = Buffer.from(JSON.stringify(mangaData, null, 2)).toString("base64");
    const result = await githubApi(
      `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}/${slug}.json`,
      "PUT",
      {
        message: `Add manga: ${title}`,
        content,
      }
    );

    return NextResponse.json({ success: true, manga: mangaData, commit: result.commit?.sha });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// PUT /api/admin/manga?pw=xxx - Update manga (edit metadata or add chapters)
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, chapters, ...metadata } = body;

    if (!slug) {
      return NextResponse.json({ error: "slug wajib" }, { status: 400 });
    }

    // Get existing manga
    const existing = await githubApi(
      `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}/${slug}.json`
    );
    if (!existing.content) {
      return NextResponse.json({ error: "Manga tidak ditemukan" }, { status: 404 });
    }

    const current = JSON.parse(Buffer.from(existing.content, "base64").toString());

    // Update metadata fields
    if (metadata.title) current.title = metadata.title;
    if (metadata.alternativeTitle !== undefined) current.alternativeTitle = metadata.alternativeTitle;
    if (metadata.cover) current.cover = metadata.cover;
    if (metadata.author) current.author = metadata.author;
    if (metadata.artist !== undefined) current.artist = metadata.artist;
    if (metadata.status) current.status = metadata.status;
    if (metadata.type) current.type = metadata.type;
    if (metadata.synopsis) current.synopsis = metadata.synopsis;
    if (metadata.genres) current.genres = metadata.genres;
    if (metadata.releaseYear) current.releaseYear = metadata.releaseYear;
    if (metadata.rating !== undefined) current.rating = metadata.rating;

    // Add new chapters
    if (chapters && Array.isArray(chapters)) {
      for (const ch of chapters) {
        // Check if chapter number already exists, replace it
        const idx = current.chapters.findIndex((c: any) => c.number === ch.number);
        if (idx >= 0) {
          current.chapters[idx] = {
            number: ch.number,
            title: ch.title || "",
            releaseDate: ch.releaseDate || new Date().toISOString(),
            pages: ch.pages || [],
          };
        } else {
          current.chapters.push({
            number: ch.number,
            title: ch.title || "",
            releaseDate: ch.releaseDate || new Date().toISOString(),
            pages: ch.pages || [],
          });
        }
      }
    }

    current.updatedAt = new Date().toISOString();
    const content = Buffer.from(JSON.stringify(current, null, 2)).toString("base64");

    const result = await githubApi(
      `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}/${slug}.json`,
      "PUT",
      {
        message: `Update manga: ${current.title}`,
        content,
        sha: existing.sha,
      }
    );

    return NextResponse.json({ success: true, manga: current, commit: result.commit?.sha });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/manga?pw=xxx&slug=xxx
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug wajib" }, { status: 400 });
  }

  try {
    const existing = await githubApi(
      `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}/${slug}.json`
    );
    if (!existing.content) {
      return NextResponse.json({ error: "Manga tidak ditemukan" }, { status: 404 });
    }

    await githubApi(
      `/repos/${OWNER}/${REPO}/contents/${DATA_PATH}/${slug}.json`,
      "DELETE",
      {
        message: `Delete manga: ${slug}`,
        sha: existing.sha,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
