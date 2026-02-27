import { useMutation } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";
import type { ImportCsvOptions, ImportResponse } from "../types/order.types";

interface ImportCsvParams {
  file: File;
  options: ImportCsvOptions;
}

export const useImportCsv = () => {
  return useMutation<ImportResponse, Error, ImportCsvParams>({
    mutationFn: ({ file, options }) => ordersApi.importCsv(file, options),
  });
};
