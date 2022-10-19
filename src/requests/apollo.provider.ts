

import { ApolloClient, HttpLink, DefaultOptions } from 'apollo-boost';
import { InMemoryCache } from '@apollo/client/cache';

let apolloClient = null;
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

export function createApolloClient() {
  if (apolloClient) {
    return apolloClient;
  }

  return apolloClient = new ApolloClient({
    link: new HttpLink({
      uri: "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql",
    }),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
}
