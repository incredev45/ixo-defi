import React, { useEffect, useMemo, useState } from 'react'
import Axios from 'axios'
import Lottie from 'react-lottie'
import styled from 'styled-components'
import { Currency } from 'types/models'
// import * as keplr from 'common/utils/keplr'
import TokenSelector from 'common/components/TokenSelector/TokenSelector'
import { StepsTransactions } from 'common/components/StepsTransactions/StepsTransactions'
import AmountInput from 'common/components/AmountInput/AmountInput'

import OverlayButtonDownIcon from 'assets/images/modal/overlaybutton-down.svg'
import NextStepIcon from 'assets/images/modal/nextstep.svg'
import EyeIcon from 'assets/images/eye-icon.svg'
import CheckIcon from 'assets/images/modal/check.svg'
import Vote from 'assets/icons/Vote'

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import {
  nFormatter,
  getBalanceNumber,
  // getUIXOAmount,
} from 'common/utils/currency.utils'
import { BigNumber } from 'bignumber.js'
import {
  apiCurrencyToCurrency,
  Currencies,
  formatCurrency,
} from 'modules/Account/Account.utils'
import { broadCastMessage } from 'common/utils/keysafe'
import pendingAnimation from 'assets/animations/transaction/pending.json'
import successAnimation from 'assets/animations/transaction/success.json'
import errorAnimation from 'assets/animations/transaction/fail.json'
import { thousandSeparator } from 'common/utils/formatters'
import { getPriceHistory } from 'modules/BondModules/bond/bond.actions'
// import { BondStateType } from 'modules/BondModules/bond/types'
import SlippageSelector, {
  SlippageType,
} from 'common/components/SlippageSelector/SlippageSelector'

const Container = styled.div`
  position: relative;
  padding: 1.5rem 4rem;
  min-width: 34rem;
  min-height: 23rem;
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

const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const Label = styled.div`
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
  handleMethodChange: (method: string) => void
}

const BuyModal: React.FunctionComponent<Props> = ({
  walletType,
  accountAddress,
}) => {
  const dispatch = useDispatch()
  const [steps] = useState(['Bond', 'Amount', 'Order', 'Sign'])
  const [asset, setAsset] = useState<Currency>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [amount, setAmount] = useState<number>(undefined)
  const [memo, setMemo] = useState<string>('')
  const [memoStatus, setMemoStatus] = useState<string>('nomemo')
  const [balances, setBalances] = useState<Currency[]>([])
  const [slippage, setSlippage] = useState<SlippageType>(SlippageType.Ten)
  const [signTXStatus, setSignTXStatus] = useState<TXStatus>(TXStatus.PENDING)
  const [signTXhash, setSignTXhash] = useState<string>(null)
  const [estBondAmount, setESTBondAmount] = useState<number>(0)
  const [txFees, setTxFees] = useState<Currency>(null)
  const [buyPrice, setBuyPrice] = useState<number>(0)

  const {
    userInfo,
    sequence: userSequence,
    accountNumber: userAccountNumber,
  } = useSelector((state: RootState) => state.account)

  const { bondDid } = useSelector((state: RootState) => state.selectedEntity)
  const {
    myStake: bondToken,
    // state: bondState,
    lastPrice,
    maxSupply,
    reserveDenom,
    symbol,
  } = useSelector((state: RootState) => state.activeBond)

  const amountValidation = useMemo(
    () =>
      amount > 0 &&
      formatCurrency({
        amount: amount,
        denom: symbol,
      }).amount <=
        maxSupply.amount - bondToken.amount &&
      amount <= asset.amount,
    // eslint-disable-next-line
    [amount],
  )

  const handleTokenChange = (token: Currency): void => {
    setAsset(token)
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
    console.log('debug', buyPrice)
    const msgs = []
    if (walletType === 'keysafe') {
      msgs.push({
        type: 'bonds/MsgBuy',
        value: {
          buyer_did: userInfo.didDoc.did,
          amount: {
            amount: (
              (amount /
                (lastPrice / (symbol === 'xusd' ? 1 : Math.pow(10, 6)))) *
              (symbol === 'xusd' ? Math.pow(10, 6) : 1)
            ).toFixed(0),
            denom: bondToken.denom,
          },
          max_prices: [
            {
              // amount: (buyPrice * (symbol === 'xusd' ? Math.pow(10, 6) : 1)).toFixed(0),
              amount: (
                ((amount *
                  (lastPrice / (symbol === 'xusd' ? 1 : Math.pow(10, 6))) *
                  (100 + slippage)) /
                  100) *
                Math.pow(10, 6)
              ).toFixed(0),
              denom:
                Currencies.find((item) => item.denom === asset.denom)
                  ?.denom ?? '',
              // denom: asset.denom === 'ixo' ? 'uixo' : asset.denom,
            },
          ],
          bond_did: bondDid,
        },
      })
    }
    return msgs
  }

  const generateTXRequestFee = (): any => {
    const fee = {
      amount: [{ amount: String(5000), denom: 'uixo' }],
      gas: String(200000),
    }
    return fee
  }

  const signingTX = async (): Promise<void> => {
    const msgs = generateTXRequestMSG()
    const fee = generateTXRequestFee()

    if (msgs.length === 0) {
      return
    }

    if (walletType === 'keysafe') {
      broadCastMessage(
        userInfo,
        userSequence,
        userAccountNumber,
        msgs,
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
    }
  }

  const handlePrevStep = (): void => {
    if (currentStep === 0) {
      return
    }
    setCurrentStep(currentStep - 1)
  }
  const handleNextStep = async (): Promise<void> => {
    setCurrentStep(currentStep + 1)
    if (currentStep === 2) {
      await signingTX()
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
        return true
      case 1:
        if (
          amount &&
          amount > 0 &&
          (memoStatus === 'nomemo' || memoStatus === 'memodone') &&
          amountValidation
          // true
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
      case 0:
        return false
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

  const getBuyPrice = async (
    bondDid: string,
    amount: number,
  ): Promise<void> => {
    Axios.get(
      `${process.env.REACT_APP_GAIA_URL}/bonds/${bondDid}/buy_price/${
        amount ?? 0
      }`,
    )
      .then((response) => response.data)
      .then((response) => response.result)
      .then((response) => {
        const { prices, tx_fees } = response
        setTxFees(formatCurrency(tx_fees[0]))
        // const rate = symbol === 'xusd' ? Math.pow(10, 6) : 1;
        setBuyPrice(Number(prices[0].amount))
      })
      .catch(() => {
        //
      })
  }

  const generateTXMessage = (txStatus: TXStatus): string => {
    switch (txStatus) {
      case TXStatus.PENDING:
        return 'Sign the Transaction'
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
            if (balance.denom === reserveDenom) {
              setAsset(formatCurrency(balance))
            }
            if (balance.denom === 'uixo') {
              //  default to ixo
              return {
                denom: 'ixo',
                amount: getBalanceNumber(new BigNumber(balance.amount)),
              }
            }
            return balance
          }),
        )
      })
    }
    if (currentStep < 3) {
      setSignTXStatus(TXStatus.PENDING)
      setSignTXhash(null)
    }
    // eslint-disable-next-line
  }, [currentStep, reserveDenom])

  useEffect(() => {
    if (bondDid) {
      // dispatch(getBondBalances(bondDid))
      dispatch(getPriceHistory(bondDid))
    }
    // eslint-disable-next-line
  }, [bondDid])

  useEffect(() => {
    if (amount > 0) {
      if (symbol === 'xusd') {
        setESTBondAmount(amount / ((lastPrice * (slippage + 100)) / 100))
      } else {
        setESTBondAmount(
          (amount * Math.pow(10, 6)) / ((lastPrice * (slippage + 100)) / 100),
        )
      }
    }
    // eslint-disable-next-line
  }, [amount, lastPrice])

  useEffect(() => {
    if (bondDid) {
      getBuyPrice(bondDid, Number(estBondAmount.toFixed(0)))
    }
  }, [bondDid, estBondAmount])

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
              disable={true}
              label={
                asset &&
                `My Balance ${thousandSeparator(asset.amount.toFixed(0), ',')}`
              }
            />
            {currentStep === 2 && (
              <img className="check-icon" src={CheckIcon} alt="check-icon" />
            )}
          </CheckWrapper>
          <div className="mt-3" />
          <CheckWrapper>
            <TokenSelector
              selectedToken={bondToken}
              tokens={[bondToken]}
              handleChange={handleTokenChange}
              disable={true}
              icon={<Vote fill="#00D2FF" />}
              label={`MAX Available ${nFormatter(
                new BigNumber(
                  symbol !== 'xusd'
                    ? formatCurrency({
                        amount: maxSupply.amount - bondToken?.amount,
                        denom:
                          bondToken?.denom === 'ixo'
                            ? 'uxio'
                            : bondToken?.denom,
                      }).amount
                    : maxSupply.amount - bondToken?.amount,
                ).toNumber(),
                2,
              )} of ${nFormatter(
                new BigNumber(
                  symbol !== 'xusd'
                    ? formatCurrency({
                        amount: maxSupply.amount,
                        denom:
                          bondToken?.denom === 'ixo'
                            ? 'uxio'
                            : bondToken?.denom,
                      }).amount
                    : maxSupply.amount,
                ).toNumber(),
                2,
              )}`}
              // label={`MAX Available ${thousandSeparator(
              //   (maxSupply.amount - bondToken.amount).toFixed(0),
              //   ',',
              // )} of ${thousandSeparator(maxSupply.amount.toFixed(0), ',')}`}
            />
            {currentStep === 2 && (
              <img className="check-icon" src={CheckIcon} alt="check-icon" />
            )}
          </CheckWrapper>
          <OverlayWrapper>
            <img src={OverlayButtonDownIcon} alt="down" />
          </OverlayWrapper>
        </>
      )}

      {currentStep === 0 && (
        <>
          <div className="mt-3" />
          <SlippageSelector
            lastPrice={lastPrice}
            denom={reserveDenom}
            symbol={symbol}
            slippage={slippage}
            handleChange={(newSlippage): void => setSlippage(newSlippage)}
          />
        </>
      )}

      {currentStep >= 1 && currentStep <= 2 && (
        <>
          <Divider className="mt-3 mb-4" />
          <CheckWrapper>
            <AmountInput
              amount={amount}
              // placeholder={`${(reserveDenom === 'uixo'
              //   ? 'ixo'
              //   : reserveDenom
              // ).toUpperCase()} Amount to Stake`}
              placeholder={`${formatCurrency({
                amount: 0,
                denom: reserveDenom,
              }).denom.toUpperCase()} Amount`}
              memo={memo}
              step={1}
              memoStatus={memoStatus}
              handleAmountChange={handleAmountChange}
              handleMemoChange={handleMemoChange}
              handleMemoStatus={setMemoStatus}
              disable={currentStep !== 1}
              suffix={asset.denom.toUpperCase()}
              error={amount > 0 && !amountValidation}
            />
            {currentStep === 2 && (
              <img className="check-icon" src={CheckIcon} alt="check-icon" />
            )}
          </CheckWrapper>
          <LabelWrapper className="mt-2">
            {(!amount || amountValidation) && (
              <>
                <Label>
                  Network fees: <strong>0.005 IXO</strong>
                </Label>
                {currentStep === 1 && !amount && (
                  <Label>
                    Last Price was{' '}
                    {symbol === 'xusd'
                      ? lastPrice
                      : formatCurrency({
                          amount: lastPrice,
                          denom: reserveDenom,
                        }).amount.toFixed(2)}{' '}
                    {(reserveDenom === 'uixo'
                      ? 'ixo'
                      : reserveDenom
                    ).toUpperCase()}{' '}
                    per {symbol.toUpperCase()}
                  </Label>
                )}
                {currentStep === 1 && amount > 0 && (
                  <Label>
                    You will receive approx. {estBondAmount.toFixed(2)}{' '}
                    {bondToken.denom.toUpperCase()}
                  </Label>
                )}
                {currentStep === 2 && (
                  <Label>
                    Transaction fees:{' '}
                    <strong>
                      {txFees.amount} {txFees.denom.toUpperCase()}
                    </strong>
                  </Label>
                )}
              </>
            )}
            {amount > 0 && !amountValidation && (
              <>
                <Label className="error">
                  Offer amount is greater than the available number of{' '}
                  {bondToken.denom.toUpperCase()}
                </Label>
              </>
            )}
          </LabelWrapper>
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

export default BuyModal
