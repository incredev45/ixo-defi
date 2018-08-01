import * as React from 'react';
import styled from 'styled-components';
import { UserInfo } from '../../types/models';
import { connect } from 'react-redux';
import { PublicSiteStoreState } from '../../redux/public_site_reducer';
import { warningToast, errorToast, successToast } from '../helpers/Toast';
import { ModalWrapper } from '../common/ModalWrapper';
import { AgentRoles } from '../../types/models';
import { Banner } from './Banner';
import { TextBlock } from './TextBlock';
import { deviceWidth } from '../../lib/commonData';
import MediaQuery from 'react-responsive';
import { Button, ButtonTypes } from '../common/Buttons';
import { Spinner } from '../common/Spinner';

const keysafeImg = require('../../assets/images/register/ixo-keysafe.png');
const amplyImg = require('../../assets/images/register/ixo-amply.png');
const keysafeIcon = require('../../assets/images/register/ixo-keysafeIco.png');

const chromeIcon = require('../../assets/images/register/chrome.png');
const mozillaIcon = require('../../assets/images/register/firefox.png');

const ModalContainer = styled.div`
	width: 360px;
	margin:0 auto;
	max-width: 100%;
	padding-bottom: 20px;

	p {
		font-weight: 300;
	}

	a {
		margin:30px 0;
	}
`;

const UnderlineLink = styled.div`
	text-decoration: underline;
	text-align: center;
	margin-bottom: 30px;

	a {
		font-size: 14px;
		font-weight: 300;
		color: white;
	}

	a:hover {
		color: ${props => props.theme.fontBlue};
	}
`;

const Section = styled.div`

`;

const RelativeCol = styled.div`
	position: relative;
`;

const BlueRow = styled.div`
	background: ${props => props.theme.bg.gradientBlue};
	margin-top: 0;

	@media (min-width: ${deviceWidth.desktop}px){
		padding-top: 70px;
	}

	@media (min-width: ${deviceWidth.desktopLarge}px){
		margin-top: -100px;
	}
`;

const KeySafe = styled.img`
	margin-bottom: -50%;
	
	@media (min-width: ${deviceWidth.desktop}px){
		position: absolute;
		top: 0;
		right: 0;
	}
`;

const Amply = styled.img`
	max-width: 100%;
	margin-left: -5%;
	margin-top: 20px;
`;

const SmallIconCol = styled.div`
	h2 i {
		font-size: 25px;
	}
`;

const BrowserIcon = styled.img`
	position: absolute;
    left: 10px;
    top: 2px;
    width: 36px
`;

export enum ModalData {
	invite = 'INVITE',
	kyc = 'KYC',
	keysafe = 'KEYSAFE'
}

export interface ParentProps {
}

export interface State {
	didDoc: any;
	isModalOpen: boolean;
	hasKeySafe: boolean;
	hasDid: boolean;
	hasKYC: boolean;
	isDidLedgered: boolean;
	activeModal: ModalData;
	toastShown: boolean;
}

export interface StateProps {
	ixo?: any;
	userInfo: UserInfo;
	keysafe: any;
}

export interface Props extends ParentProps, StateProps {}

class RegisterPage extends React.Component<Props, State> {

	state = {
		didDoc: null,
		isModalOpen: false,
		hasKeySafe: false,
		hasDid: false,
		hasKYC: false,
		isDidLedgered: false,
		activeModal: null,
		toastShown: false
		};

	busyLedgering = false;

	toggleModal = (activeModal: any, booleanVal: boolean) => {
		this.setState({isModalOpen: booleanVal, activeModal});
	}

	renderModal = () => {

		if (this.state.activeModal === ModalData.keysafe) {
			return (
				<ModalContainer> 
					<p>ixo Key Safe is your connection to the ixo blockchain. It is a secure identity vault that allows you to manage your profile and sign transactions on your projects.</p>
					<Button type={ButtonTypes.dark}><BrowserIcon src={chromeIcon} alt="Chrome"/> DOWNLOAD FOR CHROME</Button>
					<Button type={ButtonTypes.dark}><BrowserIcon src={mozillaIcon} alt="Firefox"/> DOWNLOAD FOR FIREFOX</Button>
				</ModalContainer>
			);
		} else if (this.state.activeModal === ModalData.kyc) {
			return (
				<ModalContainer> 
					<p>By becoming KYC (Know Your Customer) compliant, we can verify your identity so that you can buy tokens, create and participate in projects.</p>
					<Button type={ButtonTypes.dark}>REGISTER</Button>
					<UnderlineLink><a href="">Find out more about KYC</a></UnderlineLink>
				</ModalContainer>
			);
		} else if (this.state.activeModal = ModalData.invite) {
			return (
				<ModalContainer> 
					<p>If you have received communication from ixo inviting you to the ixo.world beta, it means that you have already been listed. 
If not, please send us an email, telling us a little about yourself and the projects you would like to create.</p>
					<Button type={ButtonTypes.dark} href="mailto:info@ixo.world">CONTACT IXO</Button>
				</ModalContainer>
			);
		} else {
			return null;
		}
	}

	renderModalHeading = () => {

		if (this.state.activeModal === ModalData.keysafe) {
			return {
				title: 'IXO KEY SAFE',
				subtitle: 'Your secure identity vault',
				image: keysafeIcon,
				width: '365'
			};
		} else if (this.state.activeModal === ModalData.kyc) {
			return {
				title: 'KYC',
				subtitle: 'Verifying that you are who you are',
				icon: 'icon-kyc',
				width: '365'
			};
		} else if (this.state.activeModal = ModalData.invite) {
			return {
				title: 'LISTED BY IXO',
				subtitle: 'Interested in creating your own projects?',
				icon: 'icon-claims',
				width: '365'
			};
		} else {
			return null;
		}
	}

	checkState() {
		// If the user has a keysafe and but the hasKeySafe not set then set state
		if (this.props.keysafe && !this.state.hasKeySafe) {
			this.props.keysafe.getDidDoc((error, response) => {
				if (error) {
					if (this.state.toastShown === false) {
						errorToast('Please log into IXO Keysafe');
						this.setState({ toastShown: true});
					}
				} else {	
					let newDidDoc = {
							did: response.didDoc.did,
							pubKey: response.didDoc.pubKey,
							credentials: []
					};
					this.setState({hasKeySafe: true, hasDid: true, didDoc: newDidDoc });
				}
			});
		}
		// So has a client side didDoc, so lets check if it is ledgered
		if (this.props.ixo && this.state.didDoc && !this.state.hasKYC) {
			let ledgerDid = () => this.ledgerDid();
			this.props.ixo.user.getDidDoc(this.state.didDoc.did).then((didResponse: any) => {
				if (didResponse) {
					if (didResponse.credentials.length === 0) {
						// Has no KYC Credential (Should look at the detail here, but right now we only have one type of credential)
						this.setState({isDidLedgered: true, didDoc: didResponse, hasKYC: false});
					} else {
						this.setState({isDidLedgered: true, didDoc: didResponse, hasKYC: true});
					}
				}
			})
			.catch((err) => {
					// Did not ledgered
					ledgerDid();
			});
		}
		if (!this.state.hasKYC) {
			// setTimeout(() => this.checkState(), 2000);
		}
	}

	componentDidMount() {
		// setTimeout(() => this.checkState(), 2000);
		this.checkState();
	}

	ledgerDid = () => {
		if (this.state.didDoc && !this.busyLedgering) {
			let payload = {didDoc: this.state.didDoc};
			this.busyLedgering = true;
			this.props.keysafe.requestSigning(JSON.stringify(payload), (error, signature) => {
				if (!error) {
					this.props.ixo.user.registerUserDid(payload, signature).then((response: any) => {
						if (response.status === 200) {
							successToast('Did document was ledgered successfully');
						} else {
							errorToast('Unable to ledger did at this time');
						}
						this.busyLedgering = false;
					});
				} else {
					this.busyLedgering = false;
				}
			});
		} else {
			if (this.state.toastShown === false) {
				warningToast('Please log into the IXO Keysafe');
				this.setState({ toastShown: true});
			}
		}
	}

	render() {
		if (!this.props.ixo) {
			return <Spinner info="Loading ixo World..."/>;
		}
		return (
			<div>
				<ModalWrapper
					isModalOpen={this.state.isModalOpen}
					handleToggleModal={(val) => this.toggleModal({}, val)}
					header={this.renderModalHeading()}
				>
					{this.renderModal()}
				</ModalWrapper>
				<Banner />
				<Section>
					<div className="container">
						<div className="row">
							<MediaQuery minWidth={`${deviceWidth.desktop}px`}>
								<div className="col-lg-6"><Amply src={amplyImg} /></div>
							</MediaQuery>
							<SmallIconCol className="col-lg-6">
								<TextBlock activeModal={this.toggleModal} title="Want to launch your own project?" icon="icon-claims" role={AgentRoles.owners} keysafe={this.state.hasKeySafe} KYC={this.state.hasKYC}>
									<p>Create your own impact projects on the ixo blockchain.</p>
								</TextBlock>
							</SmallIconCol>
						</div>
					</div>
					<BlueRow>
						<div className="container">
							<div className="row">
								<div className="col-lg-6">
									<TextBlock activeModal={this.toggleModal} blueBG={true} title="Want to become a service provider?" icon="icon-serviceproviders" role={AgentRoles.serviceProviders} keysafe={this.state.hasKeySafe} KYC={this.state.hasKYC}>
										<p>Service providers deliver the impact to a project. </p>
										<p>They are the people on the ground submitting claims, and making the difference
										e.g. planting trees or delivering books.</p>
									</TextBlock>
								</div>
								<MediaQuery minWidth={`${deviceWidth.desktop}px`}>
									<RelativeCol className="col-lg-6"><KeySafe src={keysafeImg}/></RelativeCol>
								</MediaQuery>
							</div>
						</div>
					</BlueRow>
					<div className="container">
						<div className="row">
							<div className="col-lg-6">
								<TextBlock activeModal={this.toggleModal} title="Want to become an evaluator?" icon="icon-evaluators" role={AgentRoles.evaluators} keysafe={this.state.hasKeySafe} KYC={this.state.hasKYC}>
									<p>Evaluators are individuals or entities with knowledge and experience in any given field. 
									Using this experience you determine the validity of the claims submitted on projects.  
									It is your role to approve the claims submitted on all projects.</p>
								</TextBlock>
							</div>
							<div className="col-lg-6"/>
						</div>
					</div>
				</Section>
			</div>
		);
	}
}

function mapStateToProps(state: PublicSiteStoreState) {
	return {
		ixo: state.ixoStore.ixo,
		userInfo: state.loginStore.userInfo,
		keysafe: state.keysafeStore.keysafe
	};
}

export const RegisterConnected = connect<{}, {}, ParentProps>(mapStateToProps)(RegisterPage as any);