import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import cx from 'classnames'
import Lottie from 'react-lottie'
import styled from 'styled-components'
import { Currency } from 'types/models'
// import * as keplr from 'common/utils/keplr'
import TokenSelector from 'common/components/TokenSelector/TokenSelector'
import { StepsTransactions } from 'common/components/StepsTransactions/StepsTransactions'
import AmountInput from 'common/components/AmountInput/AmountInput'

import OverlayButtonIcon from 'assets/images/modal/overlaybutton-down.svg'
import NextStepIcon from 'assets/images/modal/nextstep.svg'
import EyeIcon from 'assets/images/eye-icon.svg'
import CheckIcon from 'assets/images/modal/check.svg'

// import { useSelector } from 'react-redux'
// import { RootState } from 'common/redux/types'
import { getBalanceNumber, getUIXOAmount } from 'common/utils/currency.utils'
import { BigNumber } from 'bignumber.js'
import { apiCurrencyToCurrency } from 'modules/Account/Account.utils'
// import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
// import { broadCastMessage } from 'common/utils/keysafe'
import pendingAnimation from 'assets/animations/transaction/pending.json'
import successAnimation from 'assets/animations/transaction/success.json'
import errorAnimation from 'assets/animations/transaction/fail.json'
import ContractSelector, {
  ContractInfo,
} from 'common/components/ContractSelector/ContractSelector'
import { thousandSeparator } from 'common/utils/formatters'

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
const PrevStep = styled.div`
  position: absolute;
  left: 10px;
  bottom: 30px;
  cursor: pointer;
  transform: rotateY(180deg);
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

  &.error {
    color: #cd1c33;
    text-align: left;
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
const CheckWrapper = styled.div`
  position: relative;
  & > .check-icon {
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translate(-50%, -50%);
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
}

const MakePaymentModal: React.FunctionComponent<Props> = ({
  walletType,
  accountAddress,
}) => {
  const steps = ['Recipient', 'Amount', 'Order', 'Sign']
  const [asset, setAsset] = useState<Currency>(null)
  const [contract, setContract] = useState<ContractInfo>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [amount, setAmount] = useState<number>(null)
  const [memo, setMemo] = useState<string>('')
  const [memoStatus, setMemoStatus] = useState<string>('nomemo')
  const [balances, setBalances] = useState<Currency[]>([])
  const [contracts, setContracts] = useState<ContractInfo[]>([])
  const [signTXStatus, setSignTXStatus] = useState<TXStatus>(TXStatus.PENDING)
  const [signTXhash, setSignTXhash] = useState<string>(null)

  // const {
  //   userInfo,
  //   sequence: userSequence,
  //   accountNumber: userAccountNumber,
  // } = useSelector((state: RootState) => state.account)

  const handleTokenChange = (token: Currency): void => {
    setAsset(token)
  }
  const handleContractChange = (contract: ContractInfo): void => {
    setContract(contract)
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

  const handlePrevStep = (): void => {
    setCurrentStep(currentStep - 1)
  }
  const handleNextStep = async (): Promise<void> => {
    setCurrentStep(currentStep + 1)
    if (currentStep === 2) {
      let formattedAmount: any = asset
      if (formattedAmount.denom === 'ixo') {
        formattedAmount = {
          amount: getUIXOAmount(String(amount)),
          denom: 'uixo',
        }
      }

      if (walletType === 'keysafe') {
        // const msg = {
        //   type: 'cosmos-sdk/MsgSend',
        //   value: {
        //     amount: [formattedAmount],
        //     from_address: accountAddress,
        //     to_address: receiverAddress,
        //   },
        // }
        // const fee = {
        //   amount: [{ amount: String(5000), denom: 'uixo' }],
        //   gas: String(200000),
        // }
        // broadCastMessage(
        //   userInfo,
        //   userSequence,
        //   userAccountNumber,
        //   msg,
        //   memo,
        //   fee,
        //   (hash) => {
        //     if (hash) {
        //       setSignTXStatus(TXStatus.SUCCESS)
        //       setSignTXhash(hash)
        //     } else {
        //       setSignTXStatus(TXStatus.ERROR)
        //     }
        //   },
        // )
      } else if (walletType === 'keplr') {
        // const [accounts, offlineSigner] = await keplr.connectAccount()
        // const address = accounts[0].address
        // const client = await keplr.initStargateClient(offlineSigner)
        // const payload = {
        //   msgAny: {
        //     typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        //     value: MsgSend.fromPartial({
        //       fromAddress: address,
        //       toAddress: receiverAddress,
        //       amount: [formattedAmount],
        //     }),
        //   },
        //   chain_id: process.env.REACT_APP_CHAIN_ID,
        //   fee: {
        //     amount: [{ amount: String(5000), denom: 'uixo' }],
        //     gas: String(200000),
        //   },
        //   memo,
        // }
        // try {
        //   const result = await keplr.sendTransaction(client, address, payload)
        //   if (result) {
        //     setSignTXStatus(TXStatus.SUCCESS)
        //     setSignTXhash(result.transactionHash)
        //   } else {
        //     throw 'transaction failed'
        //   }
        // } catch (e) {
        //   setSignTXStatus(TXStatus.ERROR)
        // }
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

  const checkValidAmount = (): boolean => {
    if (amount >= asset.amount) {
      return false
    }
    return true
  }

  const enableNextStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (asset && contract) {
          return true
        }
        return false
      case 1:
        if (
          amount &&
          amount > 0 &&
          (memoStatus === 'nomemo' || memoStatus === 'memodone') &&
          checkValidAmount()
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
  const enablePrevStep = (): boolean => {
    switch (currentStep) {
      case 1:
      case 2:
        return true
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
      getBalances(accountAddress).then(({ balances }) => {
        setBalances(
          balances.map((balance) => {
            if (balance.denom === 'uixo') {
              return {
                denom: 'ixo',
                amount: getBalanceNumber(new BigNumber(balance.amount)),
              }
            }
            return balance
          }),
        )
      })
      setContracts([
        {
          name: 'Contract A',
          address: '0x00000000000000',
        },
        {
          name: 'Contract B',
          address: '0x00002000000000',
        },
        {
          name: 'Contract C',
          address: '0x00003000000000',
        },
      ])
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
          <CheckWrapper>
            <TokenSelector
              selectedToken={asset}
              tokens={balances}
              handleChange={handleTokenChange}
              disable={currentStep !== 0}
              label={
                asset &&
                `${thousandSeparator(asset.amount.toFixed(0), ',')} Available`
              }
            />
            {currentStep === 2 && (
              <img className="check-icon" src={CheckIcon} alt="check-icon" />
            )}
          </CheckWrapper>
          <div className="mt-3" />
          <CheckWrapper>
            <ContractSelector
              selectedContract={contract}
              contracts={contracts}
              handleChange={handleContractChange}
              disable={currentStep !== 0}
            />
            {currentStep === 2 && (
              <img className="check-icon" src={CheckIcon} alt="check-icon" />
            )}
          </CheckWrapper>
          <OverlayWrapper>
            <img src={OverlayButtonIcon} alt="down" />
          </OverlayWrapper>
        </>
      )}

      {currentStep >= 1 && currentStep <= 2 && (
        <>
          <Divider className="mt-3 mb-4" />
          <CheckWrapper>
            <AmountInput
              amount={amount}
              memo={memo}
              memoStatus={memoStatus}
              handleAmountChange={handleAmountChange}
              handleMemoChange={handleMemoChange}
              handleMemoStatus={setMemoStatus}
              disable={currentStep !== 1}
              error={!checkValidAmount()}
              suffix={asset.denom.toUpperCase()}
            />
            {currentStep === 2 && (
              <img className="check-icon" src={CheckIcon} alt="check-icon" />
            )}
          </CheckWrapper>
          <NetworkFee className={cx('mt-2', { error: !checkValidAmount() })}>
            {checkValidAmount() ? (
              <>
                Network fees: <strong>0.05 {asset.denom.toUpperCase()}</strong>
              </>
            ) : (
              <>Exceeds your available Account Balance</>
            )}
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
      {enablePrevStep() && (
        <PrevStep onClick={handlePrevStep}>
          <img src={NextStepIcon} alt="prev-step" />
        </PrevStep>
      )}
    </Container>
  )
}

export default MakePaymentModal
