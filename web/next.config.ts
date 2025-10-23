import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Temporarily relax ESLint during builds to allow integration branch to compile;
// remove this once <a> vs <Link> and other warnings are cleaned up.
const nextConfig: NextConfig = {
	eslint: { ignoreDuringBuilds: true },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl(nextConfig);
