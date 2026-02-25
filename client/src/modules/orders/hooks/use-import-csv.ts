import { useMutation } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import type { ImportCsvOptions } from "../types/order.types";

interface ImportCsvParams {
  file: File;
  options: ImportCsvOptions;
}

export const useImportCsv = () => {
  return useMutation({
    mutationFn: ({ file, options }: ImportCsvParams) =>
      ordersApi.importCsv(file, options),
  });
};
