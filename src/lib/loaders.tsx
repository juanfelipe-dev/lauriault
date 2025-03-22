// External Imports
import { load } from "@loaders.gl/core";
import { CSVLoader } from "@loaders.gl/csv";

// Internal Imports

const loadCSV = (path: string) => {
  return load(path, CSVLoader, { csv: { header: true } });
};

export { loadCSV };
