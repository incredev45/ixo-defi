import FormCardWrapper from 'common/components/Wrappers/FormCardWrapper/FormCardWrapper'
import { RootState } from 'common/redux/types'
import { articleFormat } from 'common/utils/formatters'
import { selectEntityConfig } from 'modules/Entities/EntitiesExplorer/EntitiesExplorer.selectors'
import React, { Dispatch } from 'react'
import { connect } from 'react-redux'
import CreateEntityBase from '../components/CreateEntityBase/CreateEntityBase'
import { goToStep } from '../CreateEntity.actions'
import {
  selectEntityType,
  selectSelectedTemplateType,
  selectStep,
} from '../CreateEntity.selectors'
import { updateExistingEntityError } from '../CreateTemplate/CreateTemplate.action'
import SelectTemplateCard from './components/SelectTemplateCard/SelectTemplateCard'
import { updateTemplateType } from './CreateSelectTemplate.action'
import { selectTemplateType } from './CreateSelectTemplate.selectors'

class CreateSelectTemplate extends CreateEntityBase<any> {
  constructor(props) {
    super(props)

    const { handleUpdateTemplateType, entityType, templateType } = props

    handleUpdateTemplateType(templateType ? templateType : entityType)
  }

  onSubmitted = (): void => {
    const { entityType, step, handleGoToStep } = this.props

    handleGoToStep(this.getNextStep(entityType, step))
  }

  onBack = (): void => {
    const { entityType, step, handleGoToStep } = this.props

    handleGoToStep(this.getPreviousStep(entityType, step))
  }

  renderSelectTemplateCard = (): JSX.Element => {
    this.cardRefs['selectTemplate'] = React.createRef()

    const { templateType, handleUpdateTemplateType } = this.props

    return (
      <FormCardWrapper
        showAddSection={false}
        title={
          templateType
            ? `Create ${articleFormat(templateType)} ${templateType} Template`
            : `Create a Template`
        }
        description="Lorem ipsum"
        keyword="template"
      >
        <SelectTemplateCard
          ref={this.cardRefs['selectTemplate']}
          handleSubmitted={(): void => console.log('no validation')}
          handleUpdateContent={handleUpdateTemplateType}
          handleError={(errors): void => console.log('ffffffffffff', errors)}
        />
      </FormCardWrapper>
    )
  }

  render(): JSX.Element {
    const { templateType } = this.props
    const identifiers: string[] = []
    identifiers.push('selectTemplate')

    return (
      <>
        {this.renderSelectTemplateCard()}
        {templateType && this.renderButtonGroup(identifiers, false)}
      </>
    )
  }
}

const mapStateToProps = (state: RootState): any => ({
  step: selectStep(state),
  entityType: selectEntityType(state),
  templateType: selectTemplateType(state),
  entityTypeMap: selectEntityConfig(state),
  validationComplete: true,
  validated: true,
  selectedTemplateType: selectSelectedTemplateType(state),
})

const mapDispatchToProps = (dispatch: Dispatch<any>): any => ({
  handleGoToStep: (step: number): void => {
    dispatch(updateExistingEntityError())
    dispatch(goToStep(step))
  },
  handleUpdateTemplateType: (formData: FormData): void => {
    dispatch(updateTemplateType(formData))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateSelectTemplate)
