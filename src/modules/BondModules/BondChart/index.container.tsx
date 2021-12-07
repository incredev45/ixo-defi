import React, { useEffect, useState } from 'react'
import { Chart } from './components/CandleChart/Chart'
import AreaChart from './components/AreaChart'
import AlphaChart from './components/AlphaChart'
import { useSelector } from 'react-redux'
import { RootState } from 'common/redux/types'
import { TransactionInfo } from 'modules/Account/types'
import { formatCurrency } from 'modules/Account/Account.utils'
import CandleStickChart from './components/CandleStickChart/index'

const seriesData = [
  {
    x: new Date(2016, 1, 1),
    y: [51.98, 56.29, 51.59, 53.85],
  },
  {
    x: new Date(2016, 2, 1),
    y: [53.66, 54.99, 51.35, 52.95],
  },
  {
    x: new Date(2016, 3, 1),
    y: [52.96, 53.78, 51.54, 52.48],
  },
  {
    x: new Date(2016, 4, 1),
    y: [52.54, 52.79, 47.88, 49.24],
  },
  {
    x: new Date(2016, 5, 1),
    y: [49.1, 52.86, 47.7, 52.78],
  },
  {
    x: new Date(2016, 6, 1),
    y: [52.83, 53.48, 50.32, 52.29],
  },
  {
    x: new Date(2016, 7, 1),
    y: [52.2, 54.48, 51.64, 52.58],
  },
  {
    x: new Date(2016, 8, 1),
    y: [52.76, 57.35, 52.15, 57.03],
  },
  {
    x: new Date(2016, 9, 1),
    y: [57.04, 58.15, 48.88, 56.19],
  },
  {
    x: new Date(2016, 10, 1),
    y: [56.09, 58.85, 55.48, 58.79],
  },
  {
    x: new Date(2016, 11, 1),
    y: [58.78, 59.65, 58.23, 59.05],
  },
  {
    x: new Date(2017, 0, 1),
    y: [59.37, 61.11, 59.35, 60.34],
  },
  {
    x: new Date(2017, 1, 1),
    y: [60.4, 60.52, 56.71, 56.93],
  },
  {
    x: new Date(2017, 2, 1),
    y: [57.02, 59.71, 56.04, 56.82],
  },
  {
    x: new Date(2017, 3, 1),
    y: [56.97, 59.62, 54.77, 59.3],
  },
  {
    x: new Date(2017, 4, 1),
    y: [59.11, 62.29, 59.1, 59.85],
  },
  {
    x: new Date(2017, 5, 1),
    y: [59.97, 60.11, 55.66, 58.42],
  },
  {
    x: new Date(2017, 6, 1),
    y: [58.34, 60.93, 56.75, 57.42],
  },
  {
    x: new Date(2017, 7, 1),
    y: [57.76, 58.08, 51.18, 54.71],
  },
  {
    x: new Date(2017, 8, 1),
    y: [54.8, 61.42, 53.18, 57.35],
  },
  {
    x: new Date(2017, 9, 1),
    y: [57.56, 63.09, 57.0, 62.99],
  },
  {
    x: new Date(2017, 10, 1),
    y: [62.89, 63.42, 59.72, 61.76],
  },
  {
    x: new Date(2017, 11, 1),
    y: [61.71, 64.15, 61.29, 63.04],
  },
]

const series = [
  {
    data: seriesData,
  },
]
interface Props {
  selectedHeader: string
}

const BondChart: React.FunctionComponent<Props> = ({ selectedHeader }) => {
  const { transactions } = useSelector((state: RootState) => state.account)
  const {
    symbol,
    priceHistory,
    reserveDenom,
    transactions: bondTransactions,
  } = useSelector((state: RootState) => state.activeBond)
  const [stakeChartData, setStakeChartData] = useState([])

  const mapTransactionsToStakeChart = (list: TransactionInfo[]): any[] => {
    return [
      {
        data: list.map((transaction: TransactionInfo) => ({
          x: transaction.date,
          y: [transaction.quantity],
        })),
      },
    ]
  }

  useEffect(() => {
    if (transactions.length > 0) {
      setStakeChartData(
        mapTransactionsToStakeChart(
          transactions.filter((transaction) => transaction.asset === symbol),
        ),
      )
    }
  }, [transactions])

  switch (selectedHeader) {
    case 'price':
      // return <Chart data={priceHistory} token={symbol.toUpperCase()} />
      // return (
      //   <AreaChart
      //     data={[
      //       {
      //         name: 'Price',
      //         data: priceHistory.map(({ price, time }) => ({
      //           x: time,
      //           y: formatCurrency({
      //             amount: price,
      //             denom: reserveDenom,
      //           }).amount.toFixed(2),
      //         })),
      //       },
      //     ]}
      //     mainColor={'#85AD5C'}
      //     lineColor={'#6FCF97'}
      //     backgroundColor="rgba(111, 207, 151, 0.2)"
      //     token={symbol.toUpperCase()}
      //     header={`${symbol.toUpperCase()} Price History`}
      //   />
      // )
      return (
        <CandleStickChart
          priceHistory={priceHistory.map(({ price, time }) => ({
            time,
            price: formatCurrency({
              amount: price,
              denom: reserveDenom,
            }).amount.toFixed(2),
          }))}
          transactions={bondTransactions.map((transaction) => ({
            time: transaction.timestamp,
            price: Number(transaction.quantity),
            buySell: transaction.buySell,
            status: transaction.status,
          }))}
          denom={symbol}
        />
      )
    case 'stake':
      return (
        <AreaChart
          data={stakeChartData}
          mainColor={'#85AD5C'}
          lineColor={'#6FCF97'}
          backgroundColor="rgba(111, 207, 151, 0.2)"
          token={symbol.toUpperCase()}
          header={`My ${symbol.toUpperCase()} Stake`}
        />
      )
    case 'raised':
      return (
        <AreaChart
          data={series}
          mainColor={'rgba(66, 203, 234, 0.15)'}
          lineColor={'#42CBEA'}
          backgroundColor="rgba(73, 191, 224, 0.2)"
        />
      )
    case 'reserve':
      return (
        <AreaChart
          data={series}
          mainColor={'rgba(66, 203, 234, 0.15)'}
          lineColor={'#42CBEA'}
          backgroundColor="rgba(73, 191, 224, 0.2)"
        />
      )
    case 'alpha':
      return <AlphaChart percentage={12} />
    default:
      return <Chart data={null} />
  }
}

export default BondChart
