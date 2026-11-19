import AddEditPage from "@/app/dash/add/page";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  return <AddEditPage />;
}