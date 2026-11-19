import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getUpdatedAtFromYear } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if film exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("psdownload")
      .select("id")
      .eq("id", id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }
    
    // If slug changed, check for duplicate
    if (body.slug && body.slug !== existing.id) {
      const { data: existingSlug } = await supabaseAdmin
        .from("psdownload")
        .select("id")
        .eq("slug", body.slug)
        .neq("id", id)
        .single();
      
      if (existingSlug) {
        return NextResponse.json(
          { error: `Slug "${body.slug}" already exists` },
          { status: 409 }
        );
      }
    }
    
    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    const allowedFields = [
      "title", "slug", "type", "year", "genre", "rating", "duration",
      "studio", "director", "cast", "poster", "backdrop", "synopsis",
      "trailer", "download_links", "featured", "popular", "updated_at"
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "download_links") {
          updateData[field] = JSON.stringify(body[field] || []);
        } else {
          updateData[field] = body[field];
        }
      }
    }
    
    // Auto-set updated_at from year if not provided
    if (!updateData.updated_at && body.year) {
      updateData.updated_at = getUpdatedAtFromYear(body.year);
    }
    
    const { data, error } = await supabaseAdmin
      .from("psdownload")
      .update(updateData)
      .eq("id", id)
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
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabaseAdmin
      .from("psdownload")
      .delete()
      .eq("id", id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}