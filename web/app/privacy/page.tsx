import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <div className="container mt-8 sm:mt-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
        {t("title")}
      </h1>
      <div className="prose max-w-none">
        <p>{t("content")}</p>
        <p className="mt-4 text-sm text-[color:var(--color-neutral-800)]">
          This placeholder will be replaced with a full policy before launch.
        </p>
      </div>
    </div>
  );
}
