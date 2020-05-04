/* eslint-disable @typescript-eslint/no-empty-interface */
import {
  EntitiesState,
  Entity,
  FilterEntitiesCategoryTagsAction,
  FilterEntitiesDatesAction,
  FilterToggleFeaturedEntitiesAction,
  FilterTogglePopularEntitiesAction,
  FilterToggleUserEntitiesAction,
  GetEntitiesAction,
  GetEntitiesSuccessAction,
  ResetEntitiesCategoryFilterAction,
  ResetEntitiesDatesFilterAction,
  ResetEntitiesFiltersAction,
} from '../../common/modules/Entities/types'

export interface Project extends Entity {}

export interface ProjectsState extends EntitiesState<Project> {}

export enum ProjectsActions {
  GetProjects = 'ixo/Projects/GET_ENTITIES',
  GetProjectsSuccess = 'ixo/Projects/GET_ENTITIES_FULFILLED',
  GetProjectsPending = 'ixo/Projects/GET_ENTITIES_PENDING',
  GetProjectsFailure = 'ixo/Projects/GET_ENTITIES_REJECTED',
  FilterToggleUserProjects = 'ixo/Projects/FILTER_TOGGLE_USER_ENTITIES',
  FilterToggleFeaturedProjects = 'ixo/Projects/FILTER_TOGGLE_FEATURED_ENTITIES',
  FilterTogglePopularProjects = 'ixo/Projects/FILTER_TOGGLE_POPULAR_ENTITIES',
  FilterDates = 'ixo/Projects/FILTER_DATES',
  ResetDatesFilter = 'ixo/Projects/RESET_DATES_FILTER',
  FilterCategoryTag = 'ixo/Projects/FILTER_CATEGORY_TAG',
  ResetCategoryFilter = 'ixo/Projects/RESET_CATEGORY_FILTER',
  ResetFilters = 'ixo/Projects/RESET_FILTERS',
}

export interface GetProjectsAction
  extends GetEntitiesAction<ProjectsActions.GetProjects, Project> {}

export interface GetProjectsSuccessAction
  extends GetEntitiesSuccessAction<
    ProjectsActions.GetProjectsSuccess,
    Project
  > {}

export interface FilterToggleUserProjectsAction
  extends FilterToggleUserEntitiesAction<
    ProjectsActions.FilterToggleUserProjects
  > {}

export interface FilterToggleFeaturedProjectsAction
  extends FilterToggleFeaturedEntitiesAction<
    ProjectsActions.FilterToggleFeaturedProjects
  > {}

export interface FilterTogglePopularProjectsAction
  extends FilterTogglePopularEntitiesAction<
    ProjectsActions.FilterTogglePopularProjects
  > {}

export interface FilterProjectsDatesAction
  extends FilterEntitiesDatesAction<ProjectsActions.FilterDates> {}

export interface ResetProjectsDatesFilterAction
  extends ResetEntitiesDatesFilterAction<ProjectsActions.ResetDatesFilter> {}

export interface FilterProjectsCategoryTagsAction
  extends FilterEntitiesCategoryTagsAction<ProjectsActions.FilterCategoryTag> {}

export interface ResetProjectsCategoryFilterAction
  extends ResetEntitiesCategoryFilterAction<
    ProjectsActions.ResetCategoryFilter
  > {}

export interface ResetProjectsFiltersAction
  extends ResetEntitiesFiltersAction<ProjectsActions.ResetFilters> {}