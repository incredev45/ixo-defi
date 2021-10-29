import * as React from 'react'
import {
  WidgetWrapper,
  gridSizes,
} from 'common/components/Wrappers/WidgetWrapper'
import blocksyncApi from 'common/api/blocksync-api/blocksync-api'
import { LayoutWrapper } from 'common/components/Wrappers/LayoutWrapper'
import { ProjectClaims } from '../../../components/Claims/Claims'
import { CircleProgressbar } from 'common/components/Widgets/CircleProgressbar/CircleProgressbar'
import BarChart, {
  BarColors,
} from 'common/components/Widgets/BarChart/BarChart'
import { LatLng, WorldMap } from 'common/components/Widgets/WorldMap/WorldMap'
import {
  Container,
  ClaimsLabels,
  ClaimsTopLabels,
  ClaimsWidget,
  SectionHeader,
  ProgressContainer,
} from './Dashboard.styles'
import { Button, ButtonTypes } from 'common/components/Form/Buttons'
import ButtonSlider from 'common/components/ButtonSlider/ButtonSlider'
import ProjectGovernance from './ProjectGovernance'
import Targets from './Targets'
import EventsTable from './EventsTable'
import CircledLocation from 'assets/icons/CircledLocation'
import Events from 'assets/icons/Events'
import { Agent } from 'modules/Entities/types'
import { ApiListedEntity } from 'common/api/blocksync-api/types/entities'
import { Link } from 'react-router-dom'

export interface Props {
  did: string
  goal: string
  serviceProvidersCount: number
  serviceProvidersPendingCount: number
  evaluatorsCount: number
  evaluatorsPendingCount: number
  claims: any[] // TODO - give type
  requiredClaimsCount: number
  successfulClaimsCount: number
  pendingClaimsCount: number
  rejectedClaimsCount: number
  remainingClaimsCount: number
  latLng: LatLng
  showAgentLinks: boolean
  showClaimLinks: boolean
  entityClaims: any[]
  agents: Agent[]
}

const Dashboard: React.FunctionComponent<Props> = ({
  did,
  serviceProvidersCount,
  serviceProvidersPendingCount,
  claims,
  goal,
  // requiredClaimsCount,
  // successfulClaimsCount,
  // pendingClaimsCount,
  // rejectedClaimsCount,
  // remainingClaimsCount,
  latLng,
  showAgentLinks,
  entityClaims,
  agents,
}) => {
  const [activeTabIndex, setActiveTabIndex] = React.useState(0)
  const [successfulClaims, setSuccessfulClaims] = React.useState(0)
  const [rejectedClaims, setRejectedClaims] = React.useState(0)
  const [pendingClaims, setPendingClaims] = React.useState(0)
  const [remainingClaims, setRemainingClaims] = React.useState(0)

  const fetchEntity = (entityDid: string): Promise<ApiListedEntity> =>
    blocksyncApi.project.getProjectByProjectDid(entityDid)

  const getClaimsOfType = (claimType: string): Array<any> => {
    return [...claims]
      .filter(
        (claim) =>
          claim.claimTemplateId === entityClaims[activeTabIndex]['@id'],
      )
      .filter((claim) => claim.status === claimType)
  }

  const handleTabClick = (tabIndex: number): void => {
    setActiveTabIndex(tabIndex)
  }

  React.useEffect(() => {
    claims.map((claim) => {
      fetchEntity(claim.claimTemplateId).then((apiEntity: ApiListedEntity) => {
        const isImpact =
          apiEntity.data.ddoTags
            .find((ddoTag) => ddoTag.category === 'Claim Type')
            ?.tags.some((tag) => tag === 'Impact')

        if (isImpact) {
          switch (claim.status) {
            case '0':
              setPendingClaims(pendingClaims + 1)
              break
            case '1':
              setSuccessfulClaims(successfulClaims + 1)
              break
            case '2':
              setRejectedClaims(rejectedClaims + 1)
              break
            case '3':
              setRemainingClaims(remainingClaims + 1)
              break
            default:
              break
          }
        }
      })
    })
  }, [])

  return (
    <LayoutWrapper className="pt-0">
      <Container className="row">
        <div className="col-md-12">
          <WidgetWrapper
            title="Project performance timeline"
            path={`/projects/${did}/detail/investors`}
            linkIcon={'icon-expand'}
            titleIcon={
              <img alt="" src={require('assets/img/sidebar/performance.svg')} />
            }
          >
            <div className="d-flex justify-content-between w-100 mt-3 mb-2 flex-column flex-sm-row flex-wrap">
              <ButtonSlider>
                {entityClaims.map((claim, key) => (
                  <Button
                    type={ButtonTypes.dark}
                    onClick={(): void => handleTabClick(key)}
                    inactive={activeTabIndex !== key}
                    key={key}
                  >
                    {claim.title}
                  </Button>
                ))}
              </ButtonSlider>
              <ClaimsTopLabels>
                <p>Claims pending</p>
                <p>Claims approved</p>
                <p>Claims rejected</p>
              </ClaimsTopLabels>
            </div>

            <BarChart
              barData={[
                {
                  data: getClaimsOfType('2'),
                  color: BarColors.red,
                  label: 'Claims Rejected',
                },
                {
                  data: getClaimsOfType('1'),
                  color: BarColors.blue,
                  label: 'Claims Approved',
                },
                {
                  data: getClaimsOfType('0'),
                  color: BarColors.darkBlue,
                  label: 'Claims Submitted',
                },
              ]}
            />
          </WidgetWrapper>
        </div>
        {
          <div
            className="col-sm-6 col-lg-3"
            style={{ paddingTop: 20, paddingBottom: 20 }}
          >
            <WidgetWrapper
              title="Project Governance"
              link={showAgentLinks}
              gridHeight={gridSizes.standard}
              path={`/projects/${did}/detail/evaluators`}
              linkIcon={'icon-expand'}
              titleIcon={
                <img
                  alt=""
                  src={require('assets/img/sidebar/governance.svg')}
                />
              }
            >
              <ProjectGovernance />
              {/* <SingleStatistic
                title="Total"
                type={StatType.decimal}
                amount={evaluatorsCount}
                descriptor={[
                  { class: 'text-block', value: 'Pending Approval:' },
                  {
                    class: 'number-orange',
                    value: evaluatorsPendingCount,
                  },
                ]}
              /> */}
            </WidgetWrapper>
          </div>
        }
        {
          <div
            className="col-sm-6 col-lg-3"
            style={{ paddingTop: 20, paddingBottom: 20 }}
          >
            <WidgetWrapper
              title="Outcomes Targets"
              link={showAgentLinks}
              gridHeight={gridSizes.standard}
              path={`/projects/${did}/detail/service-providers`}
              linkIcon={'icon-expand'}
              titleIcon={
                <img alt="" src={require('assets/img/sidebar/target.svg')} />
              }
            >
              <Targets />
            </WidgetWrapper>
          </div>
        }
        {
          <div
            className="col-lg-6"
            style={{ paddingTop: 20, paddingBottom: 20 }}
          >
            <WidgetWrapper
              title="Impact claims"
              gridHeight={gridSizes.standard}
              titleIcon={
                <img alt="" src={require('assets/img/sidebar/claim.svg')} />
              }
            >
              <ClaimsWidget>
                <ClaimsLabels>
                  <div>
                    <p>
                      <strong>{successfulClaims}</strong> claims approved
                    </p>
                    <p>
                      <strong>{pendingClaims}</strong> claims pending approval
                    </p>
                    <p>
                      <strong>{rejectedClaims}</strong> claims rejected
                    </p>
                    <p>
                      <strong>{remainingClaims}</strong> remaining claims
                    </p>
                  </div>
                  <div className="mt-2">
                    <SectionHeader>
                      <img
                        alt=""
                        src={require('assets/img/sidebar/profile.svg')}
                      />
                      Agents
                      <Link to={`/projects/${did}/detail/agents`}>
                        <i className="icon-expand" />
                      </Link>
                    </SectionHeader>
                    <div className="mt-2 mt-sm-4">
                      <div style={{ paddingLeft: '60px' }}>
                        <div>
                          <strong>{serviceProvidersCount}</strong> authorised
                          Agents
                        </div>
                        <div>
                          <strong>{serviceProvidersPendingCount}</strong>{' '}
                          pending Agents
                        </div>
                      </div>
                    </div>
                  </div>
                </ClaimsLabels>
                <ProgressContainer>
                  <CircleProgressbar
                    approved={successfulClaims}
                    rejected={rejectedClaims}
                    pending={pendingClaims}
                    totalNeeded={
                      successfulClaims +
                      rejectedClaims +
                      pendingClaims +
                      remainingClaims
                    }
                    descriptor={
                      <>
                        {goal} by {agents.length} <strong>Agents</strong>
                      </>
                    }
                  />
                </ProgressContainer>
              </ClaimsWidget>
            </WidgetWrapper>
          </div>
        }
        <div className="col-md-12">
          <WidgetWrapper
            title="Project Events"
            path={`/projects/${did}/detail/events`}
            gridHeight={gridSizes.standard}
            titleIcon={<Events />}
            link={true}
            linkIcon={'icon-expand'}
          >
            <EventsTable />
          </WidgetWrapper>
          {/* <BondTable selectedHeader={selectedHeader} /> */}
        </div>
        <div className="col-md-6" style={{ paddingTop: 20, paddingBottom: 20 }}>
          <WidgetWrapper
            title="Claim location activity"
            path={`/projects/${did}/detail/claims`}
            gridHeight={gridSizes.standard}
            titleIcon={<CircledLocation />}
          >
            <WorldMap markers={[latLng]} />
          </WidgetWrapper>
        </div>
        <div className="col-md-6" style={{ paddingTop: 20, paddingBottom: 20 }}>
          <WidgetWrapper
            title="Latest claims"
            path={`/projects/${did}/detail/claims`}
            gridHeight={gridSizes.standard}
            titleIcon={
              <img alt="" src={require('assets/img/sidebar/claim.svg')} />
            }
            linkIcon={'icon-expand'}
            link={true}
          >
            <ProjectClaims
              claims={claims}
              did={did}
              fullPage={false}
              hasLink={true}
            />
          </WidgetWrapper>
        </div>
      </Container>
    </LayoutWrapper>
  )
}

export default Dashboard
