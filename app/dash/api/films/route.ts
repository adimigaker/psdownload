import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getUpdatedAtFromYear } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (id) {
    const { data, error } = await supabaseAdmin
      .from("psdownload")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      ...data,
      download_links: typeof data.download_links === "string" 
        ? JSON.parse(data.download_links) 
        : data.download_links || [],
    });
  }
  
  // List with pagination
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");
  const genre = searchParams.get("genre");
  const type = searchParams.get("type");
  const sort = searchParams.get("sort") || "updated";
  const search = searchParams.get("search");
  
  let query = supabaseAdmin.from("psdownload").select("*", { count: "exact" });
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,id.ilike.%${search}%`);
  }
  
  if (genre) {
    query = query.ilike("genre", `%${genre}%`);
  }
  
  if (type && type !== "all") {
    query = query.eq("type", type);
  }
  
  if (sort === "year") {
    query = query.order("year", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("updated_at", { ascending: false, nullsFirst: false });
  }
  
  query = query.range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const films = (data || []).map((item) => ({
    ...item,
    download_links: typeof item.download_links === "string" 
      ? JSON.parse(item.download_links) 
      : item.download_links || [],
  }));
  
  return NextResponse.json({
    data: films,
    total: count || 0,
    page: Math.floor(offset / limit) + 1,
    perPage: limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.title || !body.slug || !body.year || !body.genre) {
      return NextResponse.json(
        { error: "Missing required fields: id, title, slug, year, genre" },
        { status: 400 }
      );
    }
    
    // Check for duplicate ID
    const { data: existing } = await supabaseAdmin
      .from("psdownload")
      .select("id")
      .eq("id", body.id)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: `ID "${body.id}" already exists` },
        { status: 409 }
      );
    }
    
    // Check for duplicate slug
    const { data: existingSlug } = await supabaseAdmin
      .from("psdownload")
      .select("id")
      .eq("slug", body.slug)
      .single();
    
    if (existingSlug) {
      return NextResponse.json(
        { error: `Slug "${body.slug}" already exists` },
        { status: 409 }
      );
    }
    
    // Prepare data for insert
    const insertData = {
      id: body.id,
      title: body.title,
      slug: body.slug,
      type: body.type || "movie",
      year: body.year,
      genre: body.genre,
      rating: body.rating,
      duration: body.duration,
      studio: body.studio,
      director: body.director,
      cast: body.cast,
      poster: body.poster,
      backdrop: body.backdrop,
      synopsis: body.synopsis,
      trailer: body.trailer,
      download_links: body.download_links ? JSON.stringify(body.download_links) : "[]",
      featured: body.featured || false,
      popular: body.popular || false,
      updated_at: body.updated_at || getUpdatedAtFromYear(body.year),
    };
    
    const { data, error } = await supabaseAdmin
      .from("psdownload")
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      ...data,
      download_links: typeof data.download_links === "string" 
        ? JSON.parse(data.download_links) 
        : data.download_links || [],
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}