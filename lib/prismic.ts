import * as prismic from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";

export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_REPO || "your-repo-name";

/**
 * Basic Prismic client factory. Replace repositoryName with your repo slug.
 * Add routes/schemas as you model content types in Prismic.
 */
export function createClient(config: prismic.ClientConfig = {}) {
  const client = prismic.createClient(repositoryName, {
    ...config,
  });

  return client;
}

/**
 * Enable previews for server components. Call inside layouts/routes where needed:
 *   export const { getStaticProps } = createPrismicPreviews();
 */
export function enablePrismicPreviews(request?: unknown) {
  const client = createClient();
  enableAutoPreviews({ client });
  return client;
}
