import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import Axios from 'axios'
import Lottie from 'react-lottie'
import styled from 'styled-components'
import { Currency } from 'types/models'
import * as keplr from 'common/utils/keplr'
import TokenSelector from 'common/components/TokenSelector/TokenSelector'
import { StepsTransactions } from 'common/components/StepsTransactions/StepsTransactions'
import AmountInput from 'common/components/AmountInput/AmountInput'

import OverlayButtonDownIcon from 'assets/images/modal/overlaybutton-down.svg'
import OverlayButtonUpIcon from 'assets/images/modal/overlaybutton-up.svg'
import NextStepIcon from 'assets/images/modal/nextstep.svg'
import EyeIcon from 'assets/images/eye-icon.svg'

import { useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import { getBalanceNumber, getUIXOAmount } from 'common/utils/currency.utils'
import { BigNumber } from 'bignumber.js'
import { apiCurrencyToCurrency } from 'modules/Account/Account.utils'
import {
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import { broadCastMessage } from 'common/utils/keysafe'
import pendingAnimation from 'assets/animations/transaction/pending.json'
import successAnimation from 'assets/animations/transaction/success.json'
import errorAnimation from 'assets/animations/transaction/fail.json'
import ValidatorSelector from 'common/components/ValidatorSelector/ValidatorSelector'

const Container = styled.div`
  position: relative;
  padding: 1.5rem 4rem;
  min-width: 34rem;
  min-height: 22rem;
`

const NextStep = styled.div`
  position: absolute;
  right: 10px;
  bottom: 30px;
  cursor: pointer;
`

const OverlayWrapper = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 120px;
}
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #235975;
`

const NetworkFee = styled.div`
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 12px;
  line-height: 22px;
  color: #83d9f2;

  strong {
    font-weight: bold;
  }
`

const TXStatusBoard = styled.div`
  & > .lottie {
    width: 80px;
  }
  & > .status {
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: #5a879d;
    text-transform: uppercase;
  }
  & > .message {
    font-size: 21px;
    color: #ffffff;
    text-align: center;
  }

  & > .transaction {
    border-radius: 100px;
    border: 1px solid #39c3e6;
    padding: 10px 30px;
    cursor: pointer;
  }
`

const StakingMethodWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 50px;

  button {
    background: #03324a;
    border: 1px solid #25758f;
    box-sizing: border-box;
    box-shadow: -13px 20px 42px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    padding: 10px;

    color: #ffeeee;
    font-family: Roboto;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    transition: all 0.2s;

    &:focus {
      outline: unset !important;
    }
    &:hover {
      color: #ffeeee !important;
    }
    &.inactive {
      color: #537b8e;
    }
    &.active {
      border: 1px solid #49bfe0;
    }
  }
`

enum TXStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}
interface Props {
  walletType: string
  accountAddress: string
  handleStakingMethodChange: (method: string) => void
}
interface ValidatorInfo {
  name: string
  address: string
  logo: string
}

const StakingModal: React.FunctionComponent<Props> = ({
  walletType,
  accountAddress,
  handleStakingMethodChange,
}) => {
  const steps = ['Validator', 'Amount', 'Order', 'Sign']
  const [asset, setAsset] = useState<Currency>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [validatorAddress, setValidatorAddress] = useState<string>(null)
  const [validatorDstAddress, setValidatorDstAddress] = useState<string>(null)
  const [selectedStakingMethod, setSelectedStakingMethod] = useState<string>(
    null,
  )
  const [amount, setAmount] = useState<number>(null)
  const [memo, setMemo] = useState<string>('')
  const [memoStatus, setMemoStatus] = useState<string>('nomemo')
  const [balances, setBalances] = useState<Currency[]>([])
  const [validators, setValidators] = useState<ValidatorInfo[]>([])
  const [selectedValidator, setSelectedValidator] = useState<ValidatorInfo>(
    null,
  )
  const [selectedValidatorDst, setSelectedValidatorDst] = useState<
    ValidatorInfo
  >(null)
  const [signTXStatus, setSignTXStatus] = useState<TXStatus>(TXStatus.PENDING)
  const [signTXhash, setSignTXhash] = useState<string>(null)

  const {
    userInfo,
    sequence: userSequence,
    accountNumber: userAccountNumber,
  } = useSelector((state: RootState) => state.account)

  const handleTokenChange = (token: Currency): void => {
    setAsset(token)
  }

  const handleValidatorChange = (validator: ValidatorInfo): void => {
    setValidatorAddress(validator.address)
    setSelectedValidator(validator)
  }
  const handleValidatorDstChange = (validator: ValidatorInfo): void => {
    setValidatorDstAddress(validator.address)
    setSelectedValidatorDst(validator)
  }

  const handleAmountChange = (event): void => {
    setAmount(event.target.value)
  }

  const handleMemoChange = (event): void => {
    const value = event.target.value
    setMemo(value)
    if (value.length > 0) {
      setMemoStatus('memowith')
    } else {
      setMemoStatus('nomemo')
    }
  }

  const generateTXRequestMSG = (): any => {
    let msg

    switch (selectedStakingMethod) {
      case 'Delegate':
        if (walletType === 'keysafe') {
          msg = {
            type: 'cosmos-sdk/MsgDelegate',
            value: {
              amount: {
                amount: getUIXOAmount(String(amount)),
                denom: 'uixo',
              },
              delegator_address: accountAddress,
              validator_address: validatorAddress,
            },
          }
        } else {
          msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
            value: MsgDelegate.fromPartial({
              amount: {
                amount: getUIXOAmount(String(amount)),
                denom: 'uixo',
              },
              delegatorAddress: accountAddress,
              validatorAddress: validatorAddress,
            }),
          }
        }
        break
      case 'Undelegate':
        if (walletType === 'keysafe') {
          msg = {
            type: 'cosmos-sdk/MsgUndelegate',
            value: {
              amount: {
                amount: getUIXOAmount(String(amount)),
                denom: 'uixo',
              },
              delegator_address: accountAddress,
              validator_address: validatorAddress,
            },
          }
        } else {
          msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
            value: MsgUndelegate.fromPartial({
              amount: {
                amount: getUIXOAmount(String(amount)),
                denom: 'uixo',
              },
              delegatorAddress: accountAddress,
              validatorAddress: validatorAddress,
            }),
          }
        }
        break
      case 'Redelegate':
        if (walletType === 'keysafe') {
          msg = {
            type: 'cosmos-sdk/MsgBeginRedelegate',
            value: {
              amount: {
                amount: getUIXOAmount(String(amount)),
                denom: 'uixo',
              },
              delegator_address: accountAddress,
              validator_src_address: validatorAddress,
              validator_dst_address: validatorDstAddress,
            },
          }
        } else {
          msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
            value: MsgBeginRedelegate.fromPartial({
              amount: {
                amount: getUIXOAmount(String(amount)),
                denom: 'uixo',
              },
              delegatorAddress: accountAddress,
              validatorSrcAddress: validatorAddress,
              validatorDstAddress: validatorDstAddress,
            }),
          }
        }
        break
      case 'GetReward':
        if (walletType === 'keysafe') {
          msg = {
            type: 'cosmos-sdk/MsgWithdrawDelegationReward',
            value: {
              delegator_address: accountAddress,
              validator_address: validatorAddress,
            },
          }
        } else {
          msg = {
            typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
            value: MsgWithdrawDelegatorReward.fromPartial({
              delegatorAddress: accountAddress,
              validatorAddress: validatorAddress,
            }),
          }
        }
        break
      default:
        break
    }
    return msg
  }

  const generateTXRequestFee = (): any => {
    let fee = {
      amount: [{ amount: String(5000), denom: 'uixo' }],
      gas: String(200000),
    }
    if (selectedStakingMethod === 'Redelegate') {
      fee = {
        amount: [{ amount: String(7500), denom: 'uixo' }],
        gas: String(300000),
      }
    }
    return fee
  }

  const handleNextStep = async (): Promise<void> => {
    setCurrentStep(currentStep + 1)
    if (currentStep === 2) {
      const msg = generateTXRequestMSG()
      const fee = generateTXRequestFee()

      if (walletType === 'keysafe') {
        broadCastMessage(
          userInfo,
          userSequence,
          userAccountNumber,
          msg,
          memo,
          fee,
          (hash) => {
            if (hash) {
              setSignTXStatus(TXStatus.SUCCESS)
              setSignTXhash(hash)
            } else {
              setSignTXStatus(TXStatus.ERROR)
            }
          },
        )
      } else if (walletType === 'keplr') {
        const [accounts, offlineSigner] = await keplr.connectAccount()
        const address = accounts[0].address
        const client = await keplr.initStargateClient(offlineSigner)

        const payload = {
          msgAny: msg,
          chain_id: process.env.REACT_APP_CHAIN_ID,
          fee,
          memo,
        }

        try {
          const result = await keplr.sendTransaction(client, address, payload)
          if (result) {
            setSignTXStatus(TXStatus.SUCCESS)
            setSignTXhash(result.transactionHash)
          } else {
            throw 'transaction failed'
          }
        } catch (e) {
          setSignTXStatus(TXStatus.ERROR)
        }
      }
    }
  }

  const handleStepChange = (index: number): void => {
    setCurrentStep(index)
  }

  const handleViewTransaction = (): void => {
    window
      .open(
        `${process.env.REACT_APP_BLOCK_SCAN_URL}/transactions/${signTXhash}`,
        '_blank',
      )
      .focus()
  }

  const enableNextStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (asset && validatorAddress && selectedStakingMethod) {
          return true
        }
        return false
      case 1:
        if (
          amount &&
          amount > 0 &&
          (memoStatus === 'nomemo' || memoStatus === 'memodone')
        ) {
          return true
        }
        return false
      case 2:
        return true
      case 3:
      default:
        return false
    }
  }

  const chooseAnimation = (txStatus): any => {
    switch (txStatus) {
      case TXStatus.PENDING:
        return pendingAnimation
      case TXStatus.SUCCESS:
        return successAnimation
      case TXStatus.ERROR:
        return errorAnimation
      default:
        return ''
    }
  }

  const getBalances = async (address: string): Promise<any> => {
    return Axios.get(
      process.env.REACT_APP_GAIA_URL + '/bank/balances/' + address,
    ).then((response) => {
      return {
        balances: response.data.result.map((coin) =>
          apiCurrencyToCurrency(coin),
        ),
      }
    })
  }

  const getValidators = (): Promise<any> => {
    return Axios.get(
      `${process.env.REACT_APP_GAIA_URL}/rest/staking/validators`,
    )
      .then((response) => response.data)
      .then(async ({ result }) => {
        return await result.map(async (validator) => {
          const identity = validator.description.identity
          let logo

          if (identity) {
            logo = await Axios.get(
              `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`,
            )
              .then((response) => response.data)
              .then((response) => response.them[0])
              .then((response) => response.pictures)
              .then((response) => response.primary)
              .then((response) => response.url)
          } else {
            logo = require('assets/img/relayer.png')
          }

          return {
            address: validator.operator_address,
            name: validator.description.moniker,
            logo,
          }
        })
      })
  }

  const generateTXMessage = (txStatus: TXStatus): string => {
    switch (txStatus) {
      case TXStatus.PENDING:
        return 'Your transaction has been submittted'
      case TXStatus.SUCCESS:
        return 'Your transaction was successful!'
      case TXStatus.ERROR:
        return `Something went wrong!\nPlease try again`
      default:
        return ''
    }
  }

  useEffect(() => {
    if (currentStep === 0) {
      setValidators([])
      getBalances(accountAddress).then(({ balances }) => {
        setBalances(balances)
      })
      getValidators().then((response) => {
        response.map(async (item) => {
          const validator = await item
          setValidators((old) => [...old, validator])
        })
      })
    }
    if (currentStep < 3) {
      setSignTXStatus(TXStatus.PENDING)
      setSignTXhash(null)
    }
  }, [currentStep])

  return (
    <Container>
      <div className="px-4 pb-4">
        <StepsTransactions
          steps={steps}
          currentStepNo={currentStep}
          handleStepChange={handleStepChange}
        />
      </div>

      {currentStep < 3 && (
        <>
          <TokenSelector
            selectedToken={asset}
            tokens={balances.map((balance) => {
              if (balance.denom === 'uixo') {
                return {
                  denom: 'ixo',
                  amount: getBalanceNumber(new BigNumber(balance.amount)),
                }
              }
              return balance
            })}
            handleChange={handleTokenChange}
            disable={currentStep !== 0}
          />
          <div className="mt-3" />
          <ValidatorSelector
            selectedValidator={selectedValidator}
            validators={validators}
            handleChange={handleValidatorChange}
            disable={currentStep !== 0}
          />
          <div className="mt-3" />
          {selectedStakingMethod === 'Redelegate' && (
            <ValidatorSelector
              selectedValidator={selectedValidatorDst}
              validators={validators}
              handleChange={handleValidatorDstChange}
              disable={currentStep !== 0}
            />
          )}
          <OverlayWrapper>
            <img
              src={
                selectedStakingMethod === 'Undelegate' ||
                selectedStakingMethod === 'GetReward'
                  ? OverlayButtonUpIcon
                  : OverlayButtonDownIcon
              }
              alt="down"
            />
          </OverlayWrapper>
        </>
      )}

      {currentStep === 0 && (
        <StakingMethodWrapper>
          <button
            className={cx([
              {
                inactive:
                  selectedStakingMethod && selectedStakingMethod !== 'Delegate',
              },
              {
                active:
                  selectedStakingMethod && selectedStakingMethod === 'Delegate',
              },
            ])}
            onClick={(): void => {
              handleStakingMethodChange('Delegate My Stake')
              setSelectedStakingMethod('Delegate')
            }}
          >
            Delegate
          </button>
          <button
            className={cx([
              {
                inactive:
                  selectedStakingMethod &&
                  selectedStakingMethod !== 'Undelegate',
              },
              {
                active:
                  selectedStakingMethod &&
                  selectedStakingMethod === 'Undelegate',
              },
            ])}
            onClick={(): void => {
              handleStakingMethodChange('Undelegate My Stake')
              setSelectedStakingMethod('Undelegate')
            }}
          >
            Un-Delegate
          </button>
          <button
            className={cx([
              {
                inactive:
                  selectedStakingMethod &&
                  selectedStakingMethod !== 'Redelegate',
              },
              {
                active:
                  selectedStakingMethod &&
                  selectedStakingMethod === 'Redelegate',
              },
            ])}
            onClick={(): void => {
              handleStakingMethodChange('Redelegate My Stake')
              setSelectedStakingMethod('Redelegate')
            }}
          >
            Re-Delegate
          </button>
          <button
            className={cx([
              {
                inactive:
                  selectedStakingMethod &&
                  selectedStakingMethod !== 'GetReward',
              },
              {
                active:
                  selectedStakingMethod &&
                  selectedStakingMethod === 'GetReward',
              },
            ])}
            onClick={(): void => {
              handleStakingMethodChange('Get Reward My Stake')
              setSelectedStakingMethod('GetReward')
            }}
          >
            Get Reward
          </button>
        </StakingMethodWrapper>
      )}

      {currentStep >= 1 && currentStep <= 2 && (
        <>
          <Divider className="mt-3 mb-4" />
          <AmountInput
            amount={amount}
            memo={memo}
            memoStatus={memoStatus}
            handleAmountChange={handleAmountChange}
            handleMemoChange={handleMemoChange}
            handleMemoStatus={setMemoStatus}
            disable={currentStep !== 1}
            suffix={asset.denom.toUpperCase()}
          />
          <NetworkFee className="mt-2">
            Network fees: <strong>0.05 {asset.denom.toUpperCase()}</strong>
          </NetworkFee>
        </>
      )}
      {currentStep === 3 && (
        <TXStatusBoard className="mx-4 d-flex align-items-center flex-column">
          <Lottie
            height={120}
            width={120}
            options={{
              loop: true,
              autoplay: true,
              animationData: chooseAnimation(signTXStatus),
            }}
          />
          <span className="status">{signTXStatus}</span>
          <span className="message">{generateTXMessage(signTXStatus)}</span>
          {signTXStatus === TXStatus.SUCCESS && (
            <div className="transaction mt-3" onClick={handleViewTransaction}>
              <img src={EyeIcon} alt="view transactions" />
            </div>
          )}
        </TXStatusBoard>
      )}

      {enableNextStep() && (
        <NextStep onClick={handleNextStep}>
          <img src={NextStepIcon} alt="next-step" />
        </NextStep>
      )}
    </Container>
  )
}

export default StakingModal
