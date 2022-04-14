import * as React from 'react'
import {
  Hover,
  TooltipWrapper,
  TooltipInner,
  AfterClick,
} from './Tooltip.styles'

export enum TooltipPosition {
  Top = 'top',
  Right = 'right',
  Bottom = 'bototm',
  Left = 'left',
}

interface Props {
  text: string
  position?: TooltipPosition
  afterClick?: boolean
  clicked?: boolean
}

const Tooltip: React.FunctionComponent<Props> = ({
  text,
  position,
  afterClick = false,
  clicked = false,
  children,
}) => {
  return !afterClick ? (
    <Hover>
      {children}
      <TooltipWrapper className={position}>
        <TooltipInner className={position}>
          <p>{text}</p>
        </TooltipInner>
      </TooltipWrapper>
    </Hover>
  ) : (
    <AfterClick clicked={clicked}>
      {children}
      <TooltipWrapper className={position}>
        <TooltipInner className={position}>
          <p>{text}</p>
        </TooltipInner>
      </TooltipWrapper>
    </AfterClick>
  )
}

Tooltip.defaultProps = {
  position: TooltipPosition.Top,
}

export default Tooltip
