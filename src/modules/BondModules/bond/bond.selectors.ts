import { RootState } from 'common/redux/types'
import { createSelector } from 'reselect'
import { BondState } from './types'

export const selectActiveBond = (state: RootState): BondState =>
  state.activeBond

export const selectBondName = createSelector(
  selectActiveBond,
  (bond: BondState) => {
    return bond ? bond.name : null
  },
)