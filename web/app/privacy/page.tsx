export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="container mt-8 sm:mt-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
        Privacy Policy
      </h1>
      <div className="prose max-w-none">
        <p>
          Your privacy is important to us. This page will contain our full privacy policy
          detailing how we collect, use, and protect your data.
        </p>
        <p className="mt-4 text-sm text-[color:var(--color-neutral-800)]">
          This placeholder will be replaced with a full policy before launch.
        </p>
      </div>
    </div>
  );
}
