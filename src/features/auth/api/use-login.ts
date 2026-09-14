import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.route.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.route.login)["$post"]>;

export const useLogin = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.route.login["$post"]({ json });
      return await response.json();
    },
  });
  return mutation;
};
