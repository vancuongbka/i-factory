import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SkillsTable } from './_components/skills-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.skills');
  return { title: t('pageTitle') };
}

export default async function SkillsPage() {

  return (
    <div className="space-y-4">
      <SkillsTable />
    </div>
  );
}
