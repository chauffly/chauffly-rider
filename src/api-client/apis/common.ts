import { AxiosRequestConfig } from 'axios';
import { HttpClient } from '../http';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;
export type LooseQueryParams = Record<string, unknown>;

export const withQuery = (
  config: AxiosRequestConfig | undefined,
  params: QueryParams | LooseQueryParams
): AxiosRequestConfig => {
  return {
    ...(config ?? {}),
    params: {
      ...(config?.params as QueryParams | undefined),
      ...params
    }
  };
};

export type ApiFactory<TApi> = (http: HttpClient) => TApi;
