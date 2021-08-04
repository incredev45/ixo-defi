import React, { FunctionComponent, useContext } from 'react'
import styled from 'styled-components'
import XIcon from 'assets/images/x-icon.svg'
import EyeIcon from 'assets/images/eye-icon.svg'
import { DashboardThemeContext, ThemeContext } from './Dashboard'

interface ValueProps {
  value: number
}

const ValueComponentContainer = styled.div<{ theme: ThemeContext }>`
  background: ${({ theme }) => (theme.isDark ? '#143F54' : '#e9edf5')};
  padding-left: 2em;
  position: relative;
`

const StyledValueContainer = styled.div`
  padding: 1em 0;
  display: flex;
  img {
    margin-right: 1em;
  }
`

const StyledEyeContainer = styled.div<{ theme: ThemeContext }>`
  position: absolute;
  height: 100%;
  right: 0;
  top: 0;
  background-color: ${({ theme }) => (theme.isDark ? '#107591' : '#e9edf5')};
  width: 4em;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Value: FunctionComponent<ValueProps> = ({ value }) => {
  const theme = useContext(DashboardThemeContext)

  return (
    <ValueComponentContainer theme={theme}>
      <StyledValueContainer>
        <img alt="" src={XIcon} />
        {value}
      </StyledValueContainer>
      <StyledEyeContainer theme={theme}>
        <img alt="" src={EyeIcon} />
      </StyledEyeContainer>
    </ValueComponentContainer>
  )
}

export default Value
