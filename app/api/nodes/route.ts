import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Check edit permission via cookie
function isAuth(req: NextRequest): boolean {
  return req.cookies.get("org_auth")?.value === "authenticated";
}

// GET — fetch all nodes
export async function GET() {
  const { data, error } = await supabase
    .from("org_nodes")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT — update a node
export async function PUT(req: NextRequest) {
  if (!isAuth(req)) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

  const { data, error } = await supabase
    .from("org_nodes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create a new node
export async function POST(req: NextRequest) {
  if (!isAuth(req)) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json();

  // Auto-generate id if not provided
  if (!body.id) {
    const { data: maxNode } = await supabase
      .from("org_nodes")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    const maxNum = maxNode ? parseInt(maxNode.id.replace("N", "")) : 0;
    body.id = `N${String(maxNum + 1).padStart(2, "0")}`;
  }

  const { data, error } = await supabase
    .from("org_nodes")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE — remove a node
export async function DELETE(req: NextRequest) {
  if (!isAuth(req)) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

  // Also delete all children recursively
  const { data: allNodes } = await supabase.from("org_nodes").select("id, parent_id");
  const toDelete = new Set<string>();

  function collectChildren(parentId: string) {
    toDelete.add(parentId);
    allNodes?.filter((n) => n.parent_id === parentId).forEach((n) => collectChildren(n.id));
  }
  collectChildren(id);

  const { error } = await supabase
    .from("org_nodes")
    .delete()
    .in("id", Array.from(toDelete));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: Array.from(toDelete) });
}
