import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const DEFAULT_BACKEND_URL = 'http://localhost:8080';
const DEFAULT_CUSTOMER_PASSWORD = 'customer-secret';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const createApolloClient = (storeSlug: string) => {
  const backendUrl =
    (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? DEFAULT_BACKEND_URL;
  const customerPassword =
    (import.meta.env.VITE_CUSTOMER_PASSWORD as string | undefined) ??
    DEFAULT_CUSTOMER_PASSWORD;

  if (!customerPassword) {
    // eslint-disable-next-line no-console
    console.warn(
      'VITE_CUSTOMER_PASSWORD is not set; falling back to default "customer-secret".',
    );
  }

  const encodedCredentials = btoa(`${storeSlug}:${customerPassword}`);

  const httpLink = new HttpLink({
    uri: `${stripTrailingSlash(backendUrl)}/customer/${storeSlug}/graphql`,
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
    },
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
};
