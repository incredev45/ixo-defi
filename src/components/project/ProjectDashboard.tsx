import * as React from 'react';
import styled from 'styled-components';
import { WidgetWrapper, gridSizes } from '../common/WidgetWrapper';
import { LayoutWrapper } from '../common/LayoutWrapper';
import { SingleStatistic } from '../common/SingleStatistic';
import { StatType, AgentRoles } from '../../types/models';
import { ProjectClaims } from './ProjectClaims';
import { CircleProgressbar } from '../widgets/CircleProgressbar';
import BarChart, { BarColors } from '../widgets/BarChart';
import { WorldMap, LatLng } from '../widgets/WorldMap';
import { isoCountriesLatLng } from '../../lib/commonData';

import { deviceWidth } from '../../lib/commonData';

const Container = styled.div`
	color: white;
`;

const ClaimsWidget = styled.div`
	display: flex;
	justify-content: space-between;
	padding:0 20px 0 0;
	flex-wrap: wrap;
`;

const ClaimsLabels = styled.div`

	margin-top: 40px;

	strong {
		font-weight: 700;
	}

	p:before {
		content:'';
		width:10px;
		height:10px;
		display: inline-block;
		margin-right: 25px;
	}
	p:nth-child(1):before {
		background: ${props => props.theme.ixoBlue};
	}
	p:nth-child(2):before {
		background: ${props => props.theme.ixoOrange};
	}
	p:nth-child(3):before {
		background: ${props => props.theme.red};
	}
	p:nth-child(4):before {
		background: #033C50;
	}
`;

const ClaimsTopLabels = styled.div`

	display: flex;
	justify-content: flex-end; 
    margin-top: -25px;
	margin-bottom: 30px;
	
	p {
		margin:0 10px;
		font-size: 13px;
	}
	p:before {
		content:'';
		width:10px;
		height:10px;
		display: inline-block;
		margin-right: 20px;
	}
	p:nth-child(1):before {
		background: #033C50;
	}

	p:nth-child(2):before {
		background: ${props => props.theme.ixoBlue};
	}
	p:nth-child(3):before {
		background: ${props => props.theme.red};
	}

	@media (max-width: ${deviceWidth.tablet}px){
		justify-content: flex-start;
		margin: 15px 0 15px 12px;
		flex-wrap: wrap;
	}
`;
export interface ParentProps {
	project: any;
	projectDid: string;
	impactAction: string;
	agentStats: any;
	claimStats: any;
	claims: any[];
	hasCapability: (Role: AgentRoles[]) => boolean;
}

export const ProjectDashboard: React.SFC<ParentProps> = ({project, projectDid, agentStats, claimStats, claims, hasCapability, impactAction}) => {

	const countClaimsOfType = (claimType: string) => {
		return [...claims].filter((claim) => claim.status === claimType).length;
	};

	const getClaimsOfType = (claimType: string) => {
		return [...claims].filter((claim) => claim.status === claimType);
	};

	const getProjectLatLng = () => {
		let latLng = isoCountriesLatLng[project.projectLocation];
		if (latLng) {
			return new LatLng(latLng.lat, latLng.lng);
		}
		return new LatLng(0, 0);
	};

	return (
		<LayoutWrapper>
			<Container className="row row-eq-height">
				<div className="col-md-12">
					<WidgetWrapper title="Project Timeline" path={`/projects/${projectDid}/detail/investors`} linkIcon={'icon-expand'}>
						<ClaimsTopLabels>
							<p>Claims pending</p>
							<p>Claims approved</p>
							<p>Claims rejected</p>
						</ClaimsTopLabels>
						<BarChart 
							barData={[
								{data: getClaimsOfType('2'), color: BarColors.red},
								{data: getClaimsOfType('1'), color: BarColors.blue},
								{data: getClaimsOfType('0'), color: BarColors.darkBlue}
							]}
						/>
					</WidgetWrapper>
				</div>
				{
				<div className="col-sm-6 col-lg-3">
					<WidgetWrapper title="Evaluators" link={hasCapability([AgentRoles.owners])} gridHeight={gridSizes.standard} path={`/projects/${projectDid}/detail/evaluators`} linkIcon={'icon-expand'}>
						<SingleStatistic 
							title="Total" 
							type={StatType.decimal}
							amount={agentStats.evaluators} 
							descriptor={[{class: 'text-block', value: 'Pending Approval:'}, {class: 'number-orange', value: agentStats.evaluatorsPending}]}
						/>
					</WidgetWrapper>
				</div>
				}
				{
				<div className="col-sm-6 col-lg-3">
					<WidgetWrapper title="Service Providers" link={hasCapability([AgentRoles.owners])} gridHeight={gridSizes.standard} path={`/projects/${projectDid}/detail/service-providers`} linkIcon={'icon-expand'}>
						<SingleStatistic 
							title="Total" 
							type={StatType.decimal}
							amount={agentStats.serviceProviders} 
							descriptor={[{class: 'text-block', value: 'Pending Approval:'}, {class: 'number-orange', value: agentStats.serviceProvidersPending}]}
						/>
					</WidgetWrapper>
				</div>
				}
				{
				<div className="col-lg-6">
					<WidgetWrapper title="Project impact claims" path={`/projects/${projectDid}/detail/claims`} gridHeight={gridSizes.standard} linkIcon={'icon-expand'} link={hasCapability([AgentRoles.owners, AgentRoles.evaluators, AgentRoles.serviceProviders, AgentRoles.investors])}>
						<ClaimsWidget>
							<ClaimsLabels>
								<p><strong>{claimStats.currentSuccessful}</strong> Approved</p>
								<p><strong>{countClaimsOfType('0')}</strong> Pending Approval</p>
								<p><strong>{claimStats.currentRejected}</strong> Rejected</p>
								<p><strong>{claimStats.required}</strong> Claims Submitted</p>
							</ClaimsLabels>
							<CircleProgressbar
								approved={claimStats.currentSuccessful}
								rejected={claimStats.currentRejected}
								pending={countClaimsOfType('0')}
								totalNeeded={claimStats.required}
								descriptor={impactAction}
							/>
						</ClaimsWidget>
					</WidgetWrapper>
				</div>
				}
				{
				<div className="col-md-6">
					<WidgetWrapper title="Latest claims" path={`/projects/${projectDid}/detail/claims`} gridHeight={gridSizes.standard}>
						<ProjectClaims claims={claims} projectDid={projectDid} fullPage={false} hasLink={hasCapability([AgentRoles.owners, AgentRoles.evaluators, AgentRoles.serviceProviders, AgentRoles.investors])} />
					</WidgetWrapper>
				</div>}
				{process.env.REACT_APP_DEV &&
				<div className="col-md-6">
					<WidgetWrapper title="Claim location activity" path={`/projects/${projectDid}/detail/claims`} gridHeight={gridSizes.standard}>
						<WorldMap markers={[getProjectLatLng()]}/>
					</WidgetWrapper>
				</div>
				}
			</Container>
		</LayoutWrapper>
	);
};