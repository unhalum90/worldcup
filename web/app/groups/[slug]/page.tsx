import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GroupTemplate from "@/app/groups/components/GroupTemplate";
import { groups } from "@/data/groups";

interface GroupPageProps {
  params: { slug: string };
}

export const dynamicParams = false;

const getGroup = (slug: string) => {
  const lookup = slug.toUpperCase();
  return groups.find((group) => group.id === lookup);
};

export async function generateStaticParams() {
  return groups.map((group) => ({
    slug: group.id.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const group = getGroup(params.slug);

  if (!group) {
    return {};
  }

  const title = `World Cup 2026 Group ${group.id} Travel Guide — ${group.title}`;

  return {
    title,
    description: group.metaDescription,
    openGraph: {
      title,
      description: group.metaDescription,
      images: [`/images/groups/${group.id.toLowerCase()}.jpg`],
    },
    alternates: {
      canonical: `https://worldcup26fanzone.com/groups/${group.id.toLowerCase()}`,
    },
  };
}

const GroupPage = ({ params }: GroupPageProps) => {
  const group = getGroup(params.slug);

  if (!group) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <GroupTemplate data={group} />
      </div>
    </div>
  );
};

export default GroupPage;
