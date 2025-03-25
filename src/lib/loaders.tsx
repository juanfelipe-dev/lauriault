// External Imports
import { load } from "@loaders.gl/core";
import { CSVLoader } from "@loaders.gl/csv";
import { JSONLoader } from "@loaders.gl/json";
import { loadInBatches } from "@loaders.gl/core";

// Internal Imports

const loadCSV = (path: string) => {
  return load(path, CSVLoader, { csv: { header: true } });
};

const loadGeoJSON = async (path: string) => {
  const batches = await loadInBatches(path, JSONLoader, {
    json: { jsonpaths: ["$.features"] },
  });

  return batches;
};

export { loadCSV, loadGeoJSON };
