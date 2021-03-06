import React, { FunctionComponent } from 'react'
import { connect, useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import { EntityType } from '../../types'
import * as entitySelectors from '../SelectedEntity.selectors'
import { Route } from 'react-router-dom'
import Dashboard from 'common/components/Dashboard/Dashboard'

import EntityExchangeTrade from './Trade'
import EntityExchangePortfolio from './Portfolio'
import EntityExchangeStake from './Stake'
import EntityExchangePools from './Pools'
import EntityExchangeAirdrop from './Airdrop'
import EntityExchangeVote from './Vote'
import EntityExchangeWallet from './Wallet'
import {
  selectPortfolioAsset,
  selectSelectedAccountAddress,
  selectStakeCellEntity,
  selectTradeMethod,
} from './EntityExchange.selectors'
import { HeaderTab } from 'common/components/Dashboard/types'
import { selectEntityConfig } from 'modules/Entities/EntitiesExplorer/EntitiesExplorer.selectors'

interface Props {
  location: any
  type: EntityType
  did: string
  name: string
  tradeMethod: string
  portfolioAsset: string
  stakeCellEntity: string
  selectedAccountAddress: string
}

const EntityExchange: FunctionComponent<Props> = ({
  did,
  type,
  name,
  tradeMethod,
  portfolioAsset,
  stakeCellEntity,
  selectedAccountAddress,
  location,
}) => {
  const entityTypeMap = useSelector(selectEntityConfig)

  const getTabButtons = (): HeaderTab[] => {
    const { pathname } = location

    const tabs = []

    if (pathname.includes('/airdrop')) {
      tabs.push({
        iconClass: `icon-project`,
        linkClass: null,
        path: `/`,
        title: entityTypeMap[EntityType.Project].plural,
        tooltip: `Explore all ${EntityType.Project}`,
      })
    } else {
      tabs.push({
        iconClass: `icon-${type.toLowerCase()}`,
        linkClass: null,
        path: `/`,
        title: entityTypeMap[type].plural,
        tooltip: `Explorer all ${type}`,
      })
    }

    if (type === EntityType.Project) {
      tabs.push({
        iconClass: 'icon-dashboard',
        linkClass: null,
        path: `/projects/${did}/detail`,
        title: 'DASHBOARD',
        tooltip: `${type} Management`,
      })
    } else {
      tabs.push({
        iconClass: 'icon-dashboard',
        linkClass: 'in-active',
        path: '/performace',
        title: 'DASHBOARD',
        tooltip: `${type} Management`,
      })
    }

    tabs.push({
      iconClass: 'icon-exchange',
      linkClass: 'active',
      path: `/projects/${did}/exchange`,
      title: 'EXCHANGE',
      tooltip: `EXCHANGE`,
    })

    return tabs
  }

  let title = name

  const routes = [
    {
      url: `/projects/${did}/exchange/portfolio`,
      icon: require('assets/img/sidebar/portfolio.svg'),
      sdg: portfolioAsset ?? 'No Asset',
      tooltip: 'My Portfolio',
    },
    {
      url: `/projects/${did}/exchange`,
      icon: require('assets/img/sidebar/trade.svg'),
      sdg: tradeMethod ?? 'Trade',
      tooltip: 'Trade',
    },
    {
      url: `/projects/${did}/exchange/stake`,
      icon: require('assets/img/sidebar/stake.svg'),
      sdg:
        stakeCellEntity ??
        (process.env.REACT_APP_CHAIN_ID.indexOf('pandora') > -1
          ? 'pandora'
          : 'impact-hub'),
      tooltip: 'Stake',
    },
    {
      url: `/projects/${did}/exchange/pools`,
      icon: require('assets/img/sidebar/pools.svg'),
      sdg: 'Explorer',
      tooltip: 'Pools',
    },
    {
      url: `/projects/${did}/exchange/airdrop`,
      icon: require('assets/img/sidebar/airdrop.svg'),
      sdg: 'Missions',
      tooltip: 'Airdrop',
    },
    // {
    //   url: `/projects/${did}/exchange/vote`,
    //   icon: require('assets/img/sidebar/vote.svg'),
    //   sdg: 'Vote',
    //   tooltip: 'Vote',
    // },
  ]

  const baseRoutes = [
    {
      url: `/projects/${did}/exchange/wallet`,
      icon: '',
      sdg: 'Exchange',
      tooltip: '',
    },
  ]

  if (location.pathname.endsWith('/exchange')) {
    baseRoutes.unshift({
      url: `/projects/${did}/overview`,
      icon: '',
      sdg: name,
      tooltip: '',
    })
    if (tradeMethod) {
      baseRoutes.push({
        url: `#`,
        icon: '',
        sdg: 'Trade',
        tooltip: '',
      })
    }
  } else if (location.pathname.endsWith('/airdrop')) {
    title = 'Airdrop Missions'
    baseRoutes.push({
      url: `#`,
      icon: '',
      sdg: 'airdrops',
      tooltip: '',
    })
  } else if (location.pathname.endsWith('/exchange/stake')) {
    title =
      (process.env.REACT_APP_CHAIN_ID.indexOf('pandora') > -1
        ? 'Pandora'
        : 'Impact Hub') + ' Validators'
    baseRoutes.push({
      url: `#`,
      icon: '',
      sdg: 'Staking',
      tooltip: '',
    })
    if (stakeCellEntity) {
      baseRoutes.push({
        url: `#`,
        icon: '',
        sdg:
          process.env.REACT_APP_CHAIN_ID.indexOf('pandora') > -1
            ? 'pandora'
            : 'impact-hub',
        tooltip: '',
      })
    }
  } else if (location.pathname.endsWith('/exchange/portfolio')) {
    title = 'My Portfolio'

    baseRoutes.push({
      url: `#`,
      icon: '',
      sdg: selectedAccountAddress ?? 'No Address',
      tooltip: '',
    })
  } else if (location.pathname.endsWith('/exchange/pools')) {
    title = 'Liquidity Pools'

    baseRoutes.push({
      url: `#`,
      icon: '',
      sdg: 'Pools',
      tooltip: '',
    })
  } else if (location.pathname.endsWith('/wallet')) {
    // temporary placeholder
    title = ''
  } else {
    baseRoutes.push({
      url: `/projects/${did}/overview`,
      icon: '',
      sdg: name,
      tooltip: '',
    })
  }

  const theme = 'dark'

  const tabs = getTabButtons()

  return (
    <Dashboard
      theme={theme}
      title={title}
      subRoutes={routes}
      baseRoutes={baseRoutes}
      tabs={tabs}
      entityType={type}
      // matchType={MatchType.exact}
    >
      <Route
        exact
        path={`/projects/:projectDID/exchange`}
        component={EntityExchangeTrade}
      />
      <Route
        exact
        path={`/projects/:projectDID/exchange/portfolio`}
        component={EntityExchangePortfolio}
      />
      <Route
        exact
        path={`/projects/:projectDID/exchange/stake`}
        component={EntityExchangeStake}
      />
      <Route
        exact
        path={`/projects/:projectDID/exchange/pools`}
        component={EntityExchangePools}
      />
      <Route
        exact
        path={`/projects/:projectDID/exchange/airdrop`}
        component={EntityExchangeAirdrop}
      />
      <Route
        exact
        path={`/projects/:projectDID/exchange/vote`}
        component={EntityExchangeVote}
      />
      {/* placeholder */}
      <Route
        exact
        path={`/projects/:projectDID/exchange/wallet`}
        component={EntityExchangeWallet}
      />
    </Dashboard>
  )
}

const mapStateToProps = (state: RootState): any => ({
  did: entitySelectors.selectEntityDid(state),
  name: entitySelectors.selectEntityName(state),
  type: entitySelectors.selectEntityType(state),
  tradeMethod: selectTradeMethod(state),
  portfolioAsset: selectPortfolioAsset(state),
  stakeCellEntity: selectStakeCellEntity(state),
  selectedAccountAddress: selectSelectedAccountAddress(state),
})

const mapDispatchToProps = (): any => ({})

export default connect(mapStateToProps, mapDispatchToProps)(EntityExchange)
