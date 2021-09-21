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
import { SimulationCompartment } from "./models/types";

export const CORE_VIEWS: Record<string, string> = {
  community: "community",
  facilities: "facilities",
  goals: "goals",
  methodology: "methodology",
} as const;

export type CoreView = keyof typeof CORE_VIEWS;

export const PATHWAYS_VIEWS: Record<string, string> = {
  pathways: "pathways",
} as const;

export const PathwaysPageIdList = [
  "prison",
  "supervision",
  "supervisionToLiberty",
  "supervisionToPrison",
] as const;

export type PathwaysPageId = typeof PathwaysPageIdList[number];

export const CORE_PATHS: Record<string, string> = {
  goals: "/goals",
  communityExplore: "/community/explore",
  communityProjections: "/community/projections",
  communityPractices: "/community/practices/:entityId?",
  facilitiesExplore: "/facilities/explore",
  facilitiesProjections: "/facilities/projections",
  methodology: "/methodology/:dashboard",
  methodologyPractices: "/methodology/practices",
  methodologyProjections: "/methodology/projections",
};

export const PATHWAYS_PATHS: Record<string, string> = {
  pathwaysPrison: "/pathways/prison/:sectionId?",
  pathwaysSupervision: "/pathways/supervision/:sectionId?",
};

export const PATHWAYS_SECTIONS: Record<string, string> = {
  populationOverTime: "populationOverTime",
};

export type PathwaysSection = keyof typeof PATHWAYS_SECTIONS;

const pathnameToView: Record<string, string> = {
  [CORE_PATHS.goals]: CORE_VIEWS.goals,
  [CORE_PATHS.communityExplore]: CORE_VIEWS.community,
  [CORE_PATHS.communityProjections]: CORE_VIEWS.community,
  [CORE_PATHS.communityPractices]: CORE_VIEWS.community,
  [CORE_PATHS.facilitiesExplore]: CORE_VIEWS.facilities,
  [CORE_PATHS.facilitiesProjections]: CORE_VIEWS.facilities,
  [CORE_PATHS.methodologyPractices]: CORE_VIEWS.methodology,
  [CORE_PATHS.methodologyProjections]: CORE_VIEWS.methodology,
};

export function getCompartmentFromView(view: CoreView): SimulationCompartment {
  return view === CORE_VIEWS.community ? "SUPERVISION" : "INCARCERATION";
}

export function getViewFromPathname(pathname: string): string {
  return pathnameToView[pathname];
}
