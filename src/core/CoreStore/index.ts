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
import { makeAutoObservable } from "mobx";

import type TenantStore from "../../RootStore/TenantStore";
import type UserStore from "../../RootStore/UserStore";
import { TenantId } from "../models/types";
import { PopulationFilterValues } from "../types/filters";
import {
  CORE_VIEWS,
  CoreView,
  getViewFromPathname,
  PATHWAYS_SECTIONS,
  PathwaysSection,
} from "../views";
import FiltersStore from "./FiltersStore";
import MetricsStore from "./MetricsStore";
import PagePracticesStore from "./PagePracticesStore";
import PageProjectionsStore from "./PageProjectionsStore";

interface CoreStoreProps {
  userStore: UserStore;
  tenantStore: TenantStore;
}

export default class CoreStore {
  userStore: UserStore;

  tenantStore: TenantStore;

  filtersStore: FiltersStore;

  metricsStore: MetricsStore;

  pagePracticesStore: PagePracticesStore;

  pageProjectionsStore: PageProjectionsStore;

  view: CoreView = CORE_VIEWS.facilities;

  section: PathwaysSection = PATHWAYS_SECTIONS.populationOverTime;

  constructor({ userStore, tenantStore }: CoreStoreProps) {
    makeAutoObservable(this);

    this.userStore = userStore;

    this.tenantStore = tenantStore;

    this.filtersStore = new FiltersStore({ rootStore: this });

    this.metricsStore = new MetricsStore({ rootStore: this });

    this.pagePracticesStore = new PagePracticesStore({
      rootStore: this,
    });

    this.pageProjectionsStore = new PageProjectionsStore({
      rootStore: this,
    });

    this.setView = this.setView.bind(this);

    this.setSection = this.setSection.bind(this);
  }

  setView(pathname: string): void {
    this.view = getViewFromPathname(pathname);
  }

  setSection(section: string): void {
    this.section = section;
  }

  get filters(): PopulationFilterValues {
    return this.filtersStore.filters;
  }

  get currentTenantId(): TenantId | undefined {
    if (!this.tenantStore.currentTenantId) return undefined;
    return this.tenantStore.currentTenantId as TenantId;
  }
}
