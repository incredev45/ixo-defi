import { Currency } from '../../types/models'

export interface DidDoc {
  did: string
  pubKey: string
}

export interface UserInfo {
  didDoc: DidDoc
  name: string
  ledgered: boolean
  loggedInKeysafe: boolean
  hasKYC: boolean
}

export enum TransactionType {
  TRANSACTION_SEND = 'send',
  TRANSACTION_TRANSFER = 'transfer',
  TRANSACTION_DELEGATE = 'delegate',
  TRANSACTION_UNDELEGATE = 'undelegate',
  TRANSACTION_BUY = 'buy',
  TRANSACTION_SELL = 'sell',
  TRANSACTION_SWAP = 'swap',
  TRANSACTION_DRAWDOWN = 'drawdown',
  TRANSACTION_WITHDRAW = 'withdraw',
  TRANSACTION_PAY = 'pay',
  TRANSACTION_PAID = 'paid',
  TRANSACTION_REFUNDED = 'refunded',
}
export interface TransactionInfo {
  id: string
  txhash: string
  date: Date
  type: TransactionType
  quantity: number
  price: number
}

export interface AccountState {
  userInfo: UserInfo
  address: string
  balances: Currency[]
  loginStatusCheckCompleted: boolean
  assistantToggled: boolean
  assistantFixed: boolean
  intent: string
  params: any
  accountNumber: string
  sequence: string
  transactionsByAsset: {
    [asset: string]: TransactionInfo[]
  }[]
}

export enum AgentRole {
  Owner = 'PO',
  Evaluator = 'EA',
  ServiceProvider = 'SA',
  Investor = 'IA',
}

export type AgentRoleStrategyMap = {
  [TKey in AgentRole]: {
    title: string
    plural: string
  }
}

export enum AccountActions {
  Login = 'ixo/Account/Login',
  Logout = 'ixo/Account/Logout',
  GetAccount = 'ixo/Account/GET_ACCOUNT',
  GetAccountSuccess = 'ixo/Account/GET_ACCOUNT_FULFILLED',
  GetAccountPending = 'ixo/Account/GET_ACCOUNT_PENDING',
  GetAccountFailure = 'ixo/Account/GET_ACCOUNT_REJECTED',
  GetTransactionsByAsset = 'ixo/Account/GET_TRANSACTIONS',
  GetTransactionsByAssetSuccess = 'ixo/Account/GET_TRANSACTIONS_FULFILLED',
  GetTransactionsByAssetPending = 'ixo/Account/GET_TRANSACTIONS_PENDING',
  GetTransactionsByAssetFailure = 'ixo/Account/GET_TRANSACTIONS_REJECTED',
  ToggleAssistant = 'ixo/Account/TOGGLE_ASSISTANT'
}

export interface LoginAction {
  type: typeof AccountActions.Login
  payload: {
    userInfo: UserInfo
    address: string
    accountNumber: string
    sequence: string
  }
}

export interface LogoutAction {
  type: typeof AccountActions.Logout
}

export interface GetAccountAction {
  type: typeof AccountActions.GetAccount
  payload: Promise<any>
}

export interface GetAccountSuccessAction {
  type: typeof AccountActions.GetAccountSuccess
  payload: {
    balances: Currency[]
  }
}

export interface GetTransactionsByAssetAction {
  type: typeof AccountActions.GetTransactionsByAsset
  payload: Promise<any>
}

export interface GetTransactionsByAssetSuccessAction {
  type: typeof AccountActions.GetTransactionsByAssetSuccess
  payload: {
    [asset: string]: TransactionInfo[]
  }[]
}

export interface ToogleAssistantPayload {
  fixed?: boolean
  forceClose?: boolean
  forceOpen?: boolean
  intent?: string
  params?: any
}

export interface ToggleAssistantAction {
  type: typeof AccountActions.ToggleAssistant
  payload: ToogleAssistantPayload
}

export type AccountActionTypes =
  | LoginAction
  | LogoutAction
  | GetAccountAction
  | GetAccountSuccessAction
  | GetTransactionsByAssetAction
  | GetTransactionsByAssetSuccessAction
  | ToggleAssistantAction
