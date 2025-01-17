// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2021 Recidiviz, Inc.
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
import moment from "moment";
import wrap from "word-wrap";

function createMethodologyFile({
  chartTitle,
  timeWindowDescription,
  filters,
  methodologyContent,
  violation,
  lastUpdatedOn,
}) {
  const infoChart = methodologyContent || [];
  const exportDate = moment().format("M/D/YYYY");

  let text = `Chart: ${chartTitle}\n`;
  if (timeWindowDescription) {
    text += `Dates: ${timeWindowDescription}\n`;
  }
  if (filters) {
    text += `Applied filters:\n`;
    text += `- ${filters.replace(/:,/g, ":")}\n`;
  }
  if (violation) {
    text += `- ${violation}\n`;
  }
  if (lastUpdatedOn) {
    text += `Data last updated on: ${lastUpdatedOn}\n`;
  }
  text += "\n";
  text += `Export Date: ${exportDate}\n\n`;

  infoChart.forEach((chart) => {
    if (chart.title) text += `${chart.title}\n`;
    const methodology = chart.methodology.replace(/\*\*/g, ``);
    text += `${wrap(methodology, { width: 80 })}\n`;
    text += "\n";
  });

  return {
    name: "methodology.txt",
    data: text,
    type: "binary",
  };
}

export default createMethodologyFile;
