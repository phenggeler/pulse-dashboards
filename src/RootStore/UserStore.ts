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
import createAuth0Client, {
  Auth0Client,
  Auth0ClientOptions,
  GetTokenSilentlyOptions,
  LogoutOptions,
  User,
} from "@auth0/auth0-spa-js";
import * as Sentry from "@sentry/react";
import { action, entries, makeAutoObservable, runInAction, when } from "mobx";
import qs from "qs";

import { identify } from "../analytics";
import { fetchOfflineUser } from "../api/fetchOfflineUser";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import {
  Navigation,
  NavigationSection,
  RoutePermission,
} from "../core/types/navigation";
import {
  CorePageIdList,
  PATHWAYS_SECTIONS,
  PathwaysPageIdList,
} from "../core/views";
import { authenticate } from "../firestore";
import tenants from "../tenants";
import isIE11 from "../utils/isIE11";
import { isOfflineMode } from "../utils/isOfflineMode";
import { getAllowedMethodology } from "../utils/navigation";
import type RootStore from ".";
import { TenantId, UserAppMetadata } from "./types";

const METADATA_NAMESPACE = process.env.REACT_APP_METADATA_NAMESPACE;

type ConstructorProps = {
  authSettings?: Auth0ClientOptions;
  rootStore?: typeof RootStore;
};

/**
 * Reactive wrapper around Auth0 client.
 * Call `authorize` to retrieve credentials or start login flow.
 *
 * @example
 *
 * ```js
 * const store = new UserStore({ authSettings: { domain, client_id, redirect_uri } });
 * if (!store.isAuthorized) {
 *   await store.authorize();
 *   // this may trigger a redirect to the Auth0 login domain;
 *   // if we're still here and user has successfully logged in,
 *   // store.isAuthorized should now be true.
 * }
 * ```
 */
export default class UserStore {
  authError?: Error;

  readonly authSettings?: Auth0ClientOptions;

  auth0?: Auth0Client;

  isAuthorized: boolean;

  userIsLoading: boolean;

  user?: User;

  getToken?: (options?: GetTokenSilentlyOptions) => void;

  logout?: (options?: LogoutOptions) => void;

  readonly rootStore?: typeof RootStore;

  constructor({ authSettings, rootStore }: ConstructorProps) {
    makeAutoObservable(this, {
      rootStore: false,
      authSettings: false,
      setAuthError: action.bound,
      userHasAccess: action.bound,
      getTokenSilently: action.bound,
      loginWithRedirect: action.bound,
    });

    this.authSettings = authSettings;
    this.rootStore = rootStore;

    this.isAuthorized = false;
    this.userIsLoading = true;
  }

  /**
   * If user already has a valid Auth0 credential, this method will retrieve it
   * and update class properties accordingly. If not, user will be redirected
   * to the Auth0 login domain for fresh authentication.
   * Returns an Error if Auth0 configuration is not present.
   */
  async authorize(handleTargetUrl: (targetUrl: string) => void): Promise<void> {
    if (isOfflineMode()) {
      this.isAuthorized = true;
      const offlineUser = await fetchOfflineUser({});
      await authenticate("fakeAuth0Token");
      runInAction(() => {
        this.user = offlineUser;
        this.userIsLoading = false;
      });
      this.getToken = () => "";
      return;
    }

    if (!this.authSettings) {
      this.authError = new Error(ERROR_MESSAGES.auth0Configuration);
      return;
    }

    try {
      const auth0 = await createAuth0Client(this.authSettings);
      this.auth0 = auth0;
      const urlQuery = qs.parse(window.location.search, {
        ignoreQueryPrefix: true,
      });

      if (urlQuery.error) {
        throw new Error(urlQuery.error_description as string);
      }

      if (urlQuery.code && urlQuery.state) {
        const { appState } = await auth0.handleRedirectCallback();
        // auth0 params are single-use, must be removed from history or they can cause errors
        let replacementUrl;
        if (appState && appState.targetUrl) {
          replacementUrl = appState.targetUrl;
        } else {
          // strip away all query params just to be safe
          replacementUrl = `${window.location.origin}${window.location.pathname}`;
        }
        window.history.replaceState({}, document.title, replacementUrl);
        handleTargetUrl(replacementUrl);
      }
      if (await auth0.isAuthenticated()) {
        const user = await auth0.getUser();
        if (user) {
          await authenticate(await auth0.getTokenSilently());
          runInAction(() => {
            this.user = user;
            this.getToken = (options?: GetTokenSilentlyOptions) =>
              this.auth0?.getTokenSilently(options);
            this.logout = (...p: any) => this.auth0?.logout(...p);
            this.isAuthorized = true;
            this.userIsLoading = false;
          });
          this.trackIdentity();
        } else {
          runInAction(() => {
            this.isAuthorized = false;
          });
        }
      } else {
        this.auth0.loginWithRedirect({
          appState: { targetUrl: window.location.href },
        });
      }
    } catch (error) {
      if (error.message === "Invalid state" && this.auth0) {
        await this.auth0.logout();
        this.auth0.loginWithRedirect();
      } else {
        this.authError = error;
      }
    }
  }

  async trackIdentity(): Promise<void> {
    await when(() => this.userAppMetadata !== undefined);
    const userId = this.userAppMetadata?.user_hash;
    if (userId) {
      identify(userId);
      Sentry.setUser({ id: userId });
    } else {
      // if we don't have a user ID make sure we don't have a lingering Sentry identity
      Sentry.setUser(null);
    }
  }

  /**
   * Returns the Auth0 app_metadata for the given user id token.
   */
  get userAppMetadata(): UserAppMetadata | undefined {
    if (!this.user) return undefined;
    const appMetadataKey = `${METADATA_NAMESPACE}app_metadata`;
    const appMetadata = this.user[appMetadataKey];
    if (!appMetadata) {
      throw Error("No app_metadata available for user");
    }
    return appMetadata;
  }

  /**
   * Returns the state code of the authorized state for the given user.
   * For Recidiviz users or users in demo mode, this will be 'recidiviz'.
   */
  get stateCode(): TenantId {
    const stateCode = this.userAppMetadata?.state_code;
    if (!stateCode) {
      throw Error("No state code set for user");
    }
    return stateCode.toUpperCase() as TenantId;
  }

  /**
   * Returns a boolean describing whether this user should see the beta charts.
   */
  get shouldSeeBetaCharts(): boolean {
    return (
      this.stateCode === "RECIDIVIZ" ||
      this.userAppMetadata?.should_see_beta_charts ||
      false
    );
  }

  /**
   * Returns the route permissions for the given user.
   */
  get routes(): RoutePermission[] {
    if (!this.userAppMetadata?.routes) return [];
    const routePermissions = entries(this.userAppMetadata?.routes);
    const routes: RoutePermission[] = routePermissions.map(
      ([fullRoute, permission]: RoutePermission) => {
        const [view, page] = fullRoute.split("_");
        const route = page ?? view;
        return [route, permission];
      }
    );
    return routes;
  }

  /**
   * Returns the allowedSupervisionLocationIds for the given user.
   */
  get allowedSupervisionLocationIds(): string[] {
    const allowedSupervisionLocationIds = this.userAppMetadata
      ?.allowed_supervision_location_ids;
    return allowedSupervisionLocationIds || [];
  }

  /**
   * Returns the list of states which are accessible to users to view data for.
   */
  get availableStateCodes(): string[] {
    const stateCodes = tenants[this.stateCode].availableStateCodes;
    if (this.blockedStateCodes.length === 0) return stateCodes;
    return stateCodes.filter((sc) => !this.blockedStateCodes.includes(sc));
  }

  /**
   * Returns the human-readable state name for the authorized state code for
   * the given user.
   */
  get stateName(): string {
    return tenants[this.stateCode].name;
  }

  /**
   * Returns any blocked state codes for the authorized user.
   */
  get blockedStateCodes(): string[] {
    const blockedStateCodes = this.userAppMetadata?.blocked_state_codes;
    if (!blockedStateCodes) return [];
    return blockedStateCodes.map((sc) => sc.toUpperCase());
  }

  /**
   * Returns whether the user is authorized for specific state code.
   */
  userHasAccess(stateCode: TenantId): boolean {
    return this.availableStateCodes.includes(stateCode);
  }

  /**
   * Returns the navigation object based on the routes the user is authorized for
   */
  get userAllowedNavigation(): Navigation | undefined {
    if (!this.rootStore?.currentTenantId) return {};
    const { navigation, betaNavigation, pagesWithRestrictions } = tenants[
      this.rootStore.currentTenantId
    ];

    const allowed =
      this.shouldSeeBetaCharts && betaNavigation ? betaNavigation : navigation;
    if (!allowed) return {};

    if (this.stateCode === "RECIDIVIZ") return allowed;

    if (pagesWithRestrictions) {
      pagesWithRestrictions.forEach((page) => {
        if (!this.canAccessRestrictedPage(page)) {
          // TODO #1561 Remove this block once CORE dashboard is removed
          if (CorePageIdList.includes(page)) {
            if (!allowed.community || allowed.community.indexOf(page) < 0)
              return;
            allowed.community.splice(allowed.community.indexOf(page), 1);
          }
          // System page permissions are on the page level,
          // so remove them as necessary from the system key array
          if (PathwaysPageIdList.includes(page)) {
            if (!allowed.system || allowed.system.indexOf(page) < 0) return;
            allowed.system.splice(allowed.system.indexOf(page), 1);
          }
          delete allowed[page as NavigationSection];
        }
      });
    }
    // If there are not any allowed system pages, delete the system key
    if (allowed.system?.length === 0) {
      delete allowed.system;
    }

    if (isIE11() && allowed?.supervisionToPrison) {
      const indexOfOfficerChart = allowed.supervisionToPrison?.findIndex(
        (r) => r === PATHWAYS_SECTIONS.countByOfficer
      );
      allowed.supervisionToPrison.splice(indexOfOfficerChart, 1);
    }

    return { ...allowed, ...getAllowedMethodology(allowed) };
  }

  canAccessRestrictedPage(pageName: string): boolean {
    if (!this.rootStore?.currentTenantId) return false;
    const { pagesWithRestrictions } = tenants[this.rootStore.currentTenantId];
    const permission = this.getRoutePermission(pageName);
    return permission || !pagesWithRestrictions?.includes(pageName);
  }

  getRoutePermission(route: string): boolean {
    const routePermission = this.routes.find((r) => r[0] === route);
    // If the route does not exist in the RoutePermissions object, default to false;
    if (!routePermission) return false;
    return routePermission[1];
  }

  setAuthError(error: Error): void {
    this.authError = error;
  }

  async loginWithRedirect(): Promise<void> {
    return this.auth0?.loginWithRedirect({
      appState: { targetUrl: window.location.href },
    });
  }

  async getTokenSilently(): Promise<any> {
    if (!this.getToken || !this.logout) return;

    const token = (await this.getToken()) as any;
    if (token instanceof Error) {
      this.userIsLoading = true;
      this.isAuthorized = false;
      await this.logout();
      await this.loginWithRedirect();
    }
    return token;
  }
}
