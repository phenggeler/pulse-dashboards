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
import cn from "classnames";
import { isEqual } from "lodash";
import { pick } from "lodash/fp";
import { get } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import { useQueryParams } from "use-query-params";

import useIsDisplayPageNavigation from "../../hooks/useIsDisplayPageNavigation";
import useIsMobile from "../../hooks/useIsMobile";
import { sortByLabel } from "../../utils/datasets";
import {
  filterQueryParams,
  removeUndefinedValuesFromObject,
} from "../../utils/navigation";
import { CoreSelect } from "../controls/CoreSelect";
import Filter from "../controls/Filter";
import FilterBar from "../controls/FilterBar";
import { useCoreStore } from "../CoreStoreProvider";
import DetailsGroup from "../DetailsGroup";
import DownloadDataButton from "../DownloadDataButton";
import MethodologyLink from "../MethodologyLink";
import MoreFilters from "../MoreFilters";
import {
  EnabledFilters,
  FilterOption,
  PopulationFilters,
} from "../types/filters";
import { FILTER_TYPES } from "../utils/constants";
import { getFilterOption } from "../utils/filterOptions";
import { PATHWAYS_PATHS } from "../views";

const PathwaysFilterBar: React.FC<{
  filterOptions: PopulationFilters;
  handleDownload: () => Promise<void>;
  chartTitle?: string;
  enabledFilters?: EnabledFilters;
  enabledMoreFilters?: EnabledFilters;
}> = ({
  filterOptions,
  handleDownload,
  chartTitle,
  enabledFilters = [],
  enabledMoreFilters = [],
}) => {
  const { filtersStore } = useCoreStore();
  const { filters } = filtersStore;

  const isDisplayNav = useIsDisplayPageNavigation();
  const isMobile = useIsMobile();

  // if current query params do not match enabled filters, update query
  const [query, setQuery] = useQueryParams(filterQueryParams);
  const cleanQuery = removeUndefinedValuesFromObject(query);
  const enabled = [...enabledFilters, ...enabledMoreFilters].reduce(
    (acc, filter) => ({ ...acc, [filter]: filtersStore.filtersLabels[filter] }),
    {}
  );
  if (!isEqual(Object.keys(enabled).sort(), Object.keys(cleanQuery).sort())) {
    setQuery({ ...enabled }, "replace");
  }

  return (
    <div
      className={cn({
        "pt-5": isDisplayNav && !isMobile,
      })}
    >
      <FilterBar
        details={
          <DetailsGroup hideOnMobile>
            <MoreFilters
              enabledFilters={enabledMoreFilters}
              filterOptions={pick(enabledMoreFilters, filterOptions)}
              setQuery={(updatedFilters: Partial<PopulationFilters>) =>
                setQuery(updatedFilters)
              }
            />
            <DownloadDataButton handleOnClick={handleDownload} />
            <MethodologyLink
              path={PATHWAYS_PATHS.methodologySystem}
              chartTitle={chartTitle}
            />
          </DetailsGroup>
        }
      >
        {enabledFilters.map((filterType) => {
          const filter = filterOptions[filterType];
          return (
            <Filter
              key={`${filterType}`}
              title={filter.title}
              width={filter.width}
            >
              <CoreSelect
                value={getFilterOption(
                  get(filters, filter.type),
                  filter.options
                )}
                options={
                  filter.type === FILTER_TYPES.TIME_PERIOD
                    ? filter.options
                    : sortByLabel(filter.options, "label")
                }
                onChange={(option: FilterOption) =>
                  setQuery({ [filter.type]: option.label })
                }
                defaultValue={filter.defaultValue}
                isChanged={
                  filter.defaultValue !==
                  getFilterOption(get(filters, filter.type), filter.options)
                    .value
                }
              />
            </Filter>
          );
        })}
      </FilterBar>
    </div>
  );
};

export default observer(PathwaysFilterBar);
