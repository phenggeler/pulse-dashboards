// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2020 Recidiviz, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// =============================================================================

const { default: fetchMetricsFromGCS } = require("../fetchMetricsFromGCS");
const { getFilesByMetricType } = require("../getFilesByMetricType");
const objectStorage = require("../objectStorage");

jest.mock("../getFilesByMetricType", () => ({
  getFilesByMetricType: jest.fn(),
}));
jest.mock("../objectStorage");

describe("fetchMetricsFromGCS tests", () => {
  const stateCode = "some code";
  const metricType = "some type";
  const file = "some file";

  const returnedFile = "some_file.json";
  const returnedFileKey = "some_file";
  const returnedFileExtension = ".json";
  const fileUpdatedAt = "Fri, 31 Oct 2020 00:39:20 GMT";
  const returnedFiles = [returnedFile];
  const downloadFileResponse = "resolved value";
  const valueKeys = "some value keys";
  const totalDataPoints = "some total data points";
  const dimensionManifest = "some dimension manifest";
  const downloadFileMetadataResponse = [
    {
      updated: fileUpdatedAt,
      metadata: {
        value_keys: JSON.stringify(valueKeys),
        total_data_points: totalDataPoints,
        dimension_manifest: JSON.stringify(dimensionManifest),
      },
    },
  ];

  it("should return array with data and metadata", (done) => {
    getFilesByMetricType.mockImplementation(() => returnedFiles);

    const downloadFileSpy = jest.spyOn(objectStorage, "downloadFile");
    const downloadFileMetadataSpy = jest.spyOn(
      objectStorage,
      "downloadFileMetadata"
    );
    downloadFileSpy.mockReturnValue(Promise.resolve(downloadFileResponse));
    downloadFileMetadataSpy.mockReturnValue(
      Promise.resolve(downloadFileMetadataResponse)
    );

    const fetchPromises = fetchMetricsFromGCS(stateCode, metricType, file).map(
      (promise) => {
        return expect(promise).resolves.toStrictEqual({
          contents: downloadFileResponse,
          fileKey: returnedFileKey,
          extension: returnedFileExtension,
          metadata: {
            updated: "Fri, 31 Oct 2020 00:39:20 GMT",
            value_keys: valueKeys,
            total_data_points: totalDataPoints,
            dimension_manifest: dimensionManifest,
          },
        });
      }
    );

    Promise.all(fetchPromises).then(() => done());

    expect(downloadFileSpy).toHaveBeenCalledTimes(1);
    expect(downloadFileMetadataSpy).toHaveBeenCalledTimes(1);
  });

  it("should return array with data and without metadata", (done) => {
    getFilesByMetricType.mockImplementation(() => returnedFiles);

    const downloadFileSpy = jest.spyOn(objectStorage, "downloadFile");
    const downloadFileMetadataSpy = jest.spyOn(
      objectStorage,
      "downloadFileMetadata"
    );
    downloadFileSpy.mockReturnValue(Promise.resolve(downloadFileResponse));
    downloadFileMetadataSpy.mockReturnValue(Promise.resolve([]));

    const fetchPromises = fetchMetricsFromGCS(stateCode, metricType, file).map(
      (promise) => {
        return expect(promise).resolves.toStrictEqual({
          contents: downloadFileResponse,
          fileKey: returnedFileKey,
          extension: returnedFileExtension,
          metadata: {},
        });
      }
    );

    Promise.all(fetchPromises).then(() => done());
  });

  it("should return array with rejected promises", (done) => {
    const error = new Error("some error");
    getFilesByMetricType.mockImplementation(() => {
      throw error;
    });

    const fetchPromises = fetchMetricsFromGCS(stateCode, metricType, file).map(
      (promise) => {
        return expect(promise).rejects.toStrictEqual(error);
      }
    );
    Promise.all(fetchPromises).then(() => done());
  });
});
