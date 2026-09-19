import { ProtocolDetailPage } from "@/components/protocol-detail-page";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ") };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProtocolDetailPage slug={slug} />;
}
