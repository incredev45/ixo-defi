import React, { useEffect, Dispatch } from 'react'
import { Redirect, Route, RouteComponentProps } from 'react-router-dom'
import { Overview } from 'pages/bond/overview'
import { Outcomes } from 'pages/bond/outcomes'
// import Exchange from 'pages/bond/exchange'
// import Orders from 'pages/bond/orders'
import ProjectAgents from 'components/project/agents/ProjectAgents'
import { withRouter } from 'react-router-dom'
import Dashboard from 'common/components/Dashboard/Dashboard'
import { getBalances as getBondBalances } from 'modules/BondModules/bond/bond.actions'
import * as bondSelectors from 'modules/BondModules/bond/bond.selectors'
import { connect, useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import { Spinner } from 'common/components/Spinner'
import * as entitySelectors from 'modules/Entities/SelectedEntity/SelectedEntity.selectors'
import { selectEntityConfig } from 'modules/Entities/EntitiesExplorer/EntitiesExplorer.selectors'
import EditEntity from 'modules/Entities/SelectedEntity/EntityEdit/EditEntity.container'

interface Props extends RouteComponentProps {
  match: any
  bondName: string
  entityName: string
  entityDid: string
  entityType: string
  bondDid: string
  investmentDid: string
  handleGetBond: (bondDid: string) => void
}

export const BondRoutes: React.FunctionComponent<Props> = ({
  match,
  bondName,
  bondDid,
  entityName,
  entityDid,
  entityType,
  handleGetBond,
}) => {
  const entityTypeMap = useSelector(selectEntityConfig)

  useEffect(() => {
    handleGetBond(bondDid)
    // eslint-disable-next-line
  }, [bondDid])

  if (bondName) {
    const baseRoutes = [
      {
        url: `/entities/select?type=${entityType}&sector=all`,
        icon: '',
        sdg: `Explore ${entityType}s`,
        tooltip: '',
      },
      {
        url: `/projects/${entityDid}/overview`,
        icon: '',
        sdg: entityName,
        tooltip: '',
      },
      {
        url: window.location.pathname,
        icon: '',
        sdg: `DASHBOARD`,
        tooltip: '',
      },
    ]

    const routes = [
      {
        url: `${match.url}/overview`,
        icon: require('assets/img/sidebar/global.svg'),
        sdg: 'overview',
        tooltip: 'Overview',
      },
      {
        url: `${match.url}/outcomes`,
        icon: require('assets/img/sidebar/outcomes.svg'),
        sdg: 'outcomes',
        tooltip: 'OUTCOMES',
      },
      {
        url: `${match.url}/agents/IA`,
        icon: require('assets/img/sidebar/profile.svg'),
        sdg: 'agents',
        tooltip: 'AGENTS',
      },
      // {
      //   url: `${match.url}/claims`,
      //   icon: require('assets/img/sidebar/claim.svg'),
      //   sdg: 'claims',
      //   tooltip: 'CLAIMS',
      // },
      // {
      //   url: `${match.url}/events`,
      //   icon: require('assets/img/sidebar/events.svg'),
      //   sdg: 'events',
      //   tooltip: 'EVENTS',
      // },
      // {
      //   url: `${match.url}/governance`,
      //   icon: require('assets/img/sidebar/economy-governance.svg'),
      //   sdg: 'governance',
      //   tooltip: 'GOVERNANCE',
      // },
      {
        url: `${match.url}/edit/${entityType}`,
        icon: require('assets/img/sidebar/settings.svg'),
        sdg: 'settings',
        tooltip: 'SETTINGS',
        strict: true,
      },
    ]

    const tabs = [
      {
        iconClass: `icon-${entityType.toLowerCase()}`,
        linkClass: null,
        path: `/projects/${entityDid}/overview`,
        title: entityTypeMap[entityType].title,
        tooltip: `View ${entityType} Page`,
      },
    ]

    tabs.push({
      iconClass: 'icon-dashboard',
      linkClass: 'in-active',
      path: `/projects/${entityDid}/bonds/${bondDid}`,
      title: 'DASHBOARD',
      tooltip: `${entityType} Management`,
    })

    // const fundingTabUrl =
    //   entityType === EntityType.Investment
    //     ? `/projects/${entityDid}/bonds/${bondDid}`
    //     : `/projects/${entityDid}/bonds/${bondDid}/accounts`
    const fundingTabUrl = `/projects/${entityDid}/funding`

    if (bondDid) {
      tabs.push({
        iconClass: 'icon-funding',
        linkClass: '',
        path: fundingTabUrl,
        title: 'FUNDING',
        tooltip: `${entityType} Funding`,
      })
    } else {
      tabs.push({
        iconClass: 'icon-funding',
        linkClass: 'restricted',
        path: fundingTabUrl,
        title: 'FUNDING',
        tooltip: `${entityType} Funding`,
      })
    }

    return (
      <Dashboard
        theme="dark"
        title={entityName}
        subRoutes={routes}
        baseRoutes={baseRoutes}
        tabs={tabs}
        entityType={entityType}
      >
        <Route exact path={`${match.url}`}>
          <Redirect to={`${match.url}/overview`} />
        </Route>
        <Route exact path={`${match.url}/overview`} component={Overview} />
        <Route exact path={`${match.url}/outcomes`} component={Outcomes} />
        <Route
          exact
          path={`${match.url}/agents/:agentType`}
          component={ProjectAgents}
        />
        <Route path={`${match.url}/edit/:entityType`} component={EditEntity} />
      </Dashboard>
    )
  }

  return <Spinner info="Loading Bond..." />
}

const mapStateToProps = (state: RootState): any => ({
  bondName: bondSelectors.selectBondName(state),
  entityName: entitySelectors.selectEntityName(state),
  entityDid: entitySelectors.selectEntityDid(state),
  entityType: entitySelectors.selectEntityType(state),
  bondDid: entitySelectors.selectEntityBondDid(state),
  entityCreatorDid: entitySelectors.selectEntityCreator(state),
  investmentDid: entitySelectors.selectEntityInvestmentDid(state),
})

const mapDispatchToProps = (dispatch: Dispatch<any>): any => ({
  handleGetBond: (bondDid: string): void => dispatch(getBondBalances(bondDid)),
})

const BondsWrapperConnected = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BondRoutes as any),
) as any

export default BondsWrapperConnected
