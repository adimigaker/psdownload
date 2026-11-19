import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");
  const genre = searchParams.get("genre");
  const type = searchParams.get("type");
  const sort = searchParams.get("sort") || "updated";
  
  let query = supabaseAdmin.from("psdownload").select("*");
  
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
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const films = (data || []).map((item) => ({
    ...item,
    download_links: typeof item.download_links === "string" 
      ? JSON.parse(item.download_links) 
      : item.download_links || [],
  }));
  
  return NextResponse.json(films);
}