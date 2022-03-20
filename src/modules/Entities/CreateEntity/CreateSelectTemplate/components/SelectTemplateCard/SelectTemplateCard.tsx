import MultiControlForm from 'common/components/JsonForm/MultiControlForm/MultiControlForm'
import React, { FunctionComponent } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { FormCardProps } from '../../../types'
import { selectTemplateType } from '../../CreateSelectTemplate.selectors'

const FormContainer = styled.div`
  border-top: 1px solid #e8edee;
  margin-top: 4rem;
  padding-top: 1.25rem;
`

// eslint-disable-next-line react/display-name
const SelectTemplateCard: FunctionComponent<FormCardProps> = React.forwardRef(
  ({ handleSubmitted, handleUpdateContent }, ref) => {
    const templateType = useSelector(selectTemplateType)
    const templateTypes = [
      'Claim',
      'Project',
      'Investment',
      'Asset',
      'Oracle',
      'DAO',
    ]
    const templateTypeNames = [
      'Claim',
      'Project',
      'Investment',
      'Asset (Coming Soon)',
      'Oracle (Coming Soon)',
      'DAO (Coming Soon)',
    ]
    const formData = {
      templateType: templateType,
    }

    const schema = {
      type: 'object',
      properties: {
        templateType: {
          type: 'string',
          title: 'Select the Type of Template to Create',
          enum: templateTypes,
          enumNames: templateTypeNames,
        },
      },
    }

    const uiSchema = {
      templateType: {
        'ui:placeholder': 'Select Template',
      },
    }

    return (
      <FormContainer>
        <MultiControlForm
          formData={formData}
          ref={ref}
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={handleSubmitted}
          onFormDataChange={handleUpdateContent}
          liveValidate={false}
          multiColumn
        >
          <></>
        </MultiControlForm>
      </FormContainer>
    )
  },
)

export default SelectTemplateCard
