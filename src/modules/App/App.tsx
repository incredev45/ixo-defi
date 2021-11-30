import * as React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import * as ReactGA from 'react-ga'
import { ThemeProvider } from 'styled-components'
import AssistantContext from 'common/contexts/Assistant'
import { Transition, animated } from 'react-spring/renderprops'
import FundingChat from 'modules/FundingChat/FundingChat.container'
import { isMobile } from 'react-device-detect'

import { HeaderConnected } from '../../common/components/Header/HeaderContainer'
import Footer from '../../common/components/Footer/FooterContainer'
import { RootState } from '../../common/redux/types'
import { theme, Container, ContentWrapper } from './App.styles'
import { UserInfo } from '../Account/types'
import { toggleAssistant, updateLoginStatus } from '../Account/Account.actions'
import ScrollToTop from '../../common/components/ScrollToTop'
import { Routes } from '../../routes'
import { Spinner } from '../../common/components/Spinner'
import '../../assets/icons.css'
import blocksyncApi from 'common/api/blocksync-api/blocksync-api'
import { getRelayers } from 'modules/relayer/relayer.actions'
import {
  changeEntitiesType,
  getEntityConfig,
} from 'modules/Entities/EntitiesExplorer/EntitiesExplorer.actions'
import { EntityType, EntityTypeStrategyMap } from 'modules/Entities/types'

require('dotenv').config()

ReactGA.initialize('UA-106630107-5')
ReactGA.pageview(window.location.pathname + window.location.search)

export interface State {
  loginError: string
  error: any
  errorInfo: any
}

export interface Props {
  pingError?: string
  pingResult?: string
  userInfo: UserInfo
  location: any
  history: any
  match: any
  entityTypeMap: EntityTypeStrategyMap
  onIxoInit: () => void
  onKeysafeInit: () => void
  onUpdateLoginStatus: () => void
  onWeb3Connect: () => void
  loginStatusCheckCompleted: boolean
  assistantToggled: boolean
  toggleAssistant: () => void
  assistantFixed: boolean
  handleGetRelayers: () => void
  handleGetEntityConfig: () => void
  handleChangeEntitiesType: (type: EntityType) => void
}

class App extends React.Component<Props, State> {
  state = {
    loginError: null,
    isProjectPage: false,
    errorInfo: null,
    error: null,
  }

  private keySafeInterval = null

  componentDidMount(): void {
    this.props.onUpdateLoginStatus()
    this.props.handleGetRelayers()
    this.props.handleGetEntityConfig()

    this.keySafeInterval = setInterval(
      () => this.props.onUpdateLoginStatus(),
      3000,
    )
  }
  UNSAFE_componentWillReceiveProps(props: any): void {
    if (props.entityTypeMap !== this.props.entityTypeMap) {
      this.props.handleChangeEntitiesType(EntityType.Project)
    }
  }

  componentWillUnmount(): void {
    clearInterval(this.keySafeInterval)
  }

  handlePingExplorer = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const t0 = performance.now()
      blocksyncApi.network
        .pingIxoExplorer()
        .then((result) => {
          if (result === 'API is running') {
            const t1 = performance.now()
            resolve(Math.trunc(t1 - t0))
          } else {
            reject(0)
          }
        })
        .catch(() => {
          reject(0)
        })
    })
  }

  render(): JSX.Element {
    const { assistantToggled, toggleAssistant, assistantFixed } = this.props
    let assistantBaseStyles: any = {
      background: '#F0F3F9',
      zIndex: 8,
    }

    if (assistantFixed || isMobile) {
      assistantBaseStyles = {
        ...assistantBaseStyles,
        position: 'fixed',
        right: 0,
      }
    }

    return (
      <ThemeProvider theme={theme}>
        <AssistantContext.Provider value={{ active: assistantToggled }}>
          <ScrollToTop>
            <Container>
              <HeaderConnected
                pingIxoExplorer={this.handlePingExplorer}
                simpleHeader={false}
                userInfo={this.props.userInfo}
              />
              <ToastContainer hideProgressBar={true} position="top-right" />
              <div className="d-flex" style={{ flex: 1 }}>
                <ContentWrapper>
                  {(this.props.loginStatusCheckCompleted || !window['ixoKs']) &&
                  this.props.entityTypeMap ? (
                    <Routes />
                  ) : (
                    <Spinner info={'Loading ixo.world...'} />
                  )}
                </ContentWrapper>
                <Transition
                  items={assistantToggled}
                  from={{ width: '0%' }}
                  enter={{ width: isMobile ? '100%' : '25%' }}
                  leave={{ width: '0%' }}
                >
                  {(assistantToggled): any =>
                    assistantToggled &&
                    ((props): JSX.Element => (
                      <animated.div
                        style={{
                          ...assistantBaseStyles,
                          ...props,
                        }}
                      >
                        {assistantToggled && (
                          <FundingChat assistantPanelToggle={toggleAssistant} />
                        )}
                      </animated.div>
                    ))
                  }
                </Transition>
              </div>
              <Footer />
            </Container>
          </ScrollToTop>
        </AssistantContext.Provider>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = (state: RootState): Record<string, any> => ({
  userInfo: state.account.userInfo,
  assistantToggled: state.account.assistantToggled,
  assistantFixed: state.account.assistantFixed,
  loginStatusCheckCompleted: state.account.loginStatusCheckCompleted,
  entityTypeMap: state.entities.entityConfig,
})

const mapDispatchToProps = (dispatch: any): any => ({
  onUpdateLoginStatus: (): void => {
    dispatch(updateLoginStatus())
  },
  toggleAssistant: (): void => {
    dispatch(toggleAssistant())
  },
  handleGetRelayers: (): void => dispatch(getRelayers()),
  handleGetEntityConfig: (): void => dispatch(getEntityConfig()),
  handleChangeEntitiesType: (type: EntityType): void =>
    dispatch(changeEntitiesType(type)),
})

export const AppConnected = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(App as any) as any,
)
