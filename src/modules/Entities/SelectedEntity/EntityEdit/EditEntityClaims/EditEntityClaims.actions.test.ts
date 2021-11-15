import { v4 } from 'uuid'
jest.mock('uuid')
import * as SUT from './EditEntityClaims.actions'
import { EditEntityClaimsActions } from './types'

describe('EditEntityClaims Actions', () => {
  describe('entityClaim', () => {
    it('should edit an action to add a new entity claim section', () => {
      const id = 'newId'
      v4.mockImplementationOnce(() => id)

      // when ... we call the addEntityClaim action
      const action = SUT.addEntityClaim()

      // then ... we should expect it to edit an action with the correct type and payload
      expect(action.type).toEqual(EditEntityClaimsActions.AddEntityClaim)
      expect(action.payload).toEqual({
        id,
      })
    })

    it('should edit an action to remove an entity claim section', () => {
      const id = 'existingId'

      // when ... we call the removeEntityClaim action
      const action = SUT.removeEntityClaim(id)

      // then ... we should expect it to edit an action with the correct type and payload
      expect(action.type).toEqual(EditEntityClaimsActions.RemoveEntityClaim)
      expect(action.payload).toEqual({
        id,
      })
    })
  })

  describe('entityClaimTemplate', () => {
    it('should edit an action to update an entity claim template', () => {
      const id = 'someId'
      const entityClaimId = 'someEntityClaimId'
      const templateId = 'someTemplateId'
      const title = 'someTitle'
      const description = 'someDescription'
      const isPrivate = true
      const minTargetClaims = 10
      const maxTargetClaims = 20
      const submissionStartDate = 'fromDate'
      const goal = 'someGoal'
      const submissionEndDate = 'toDate'
      const submissionDates = `${submissionStartDate}|${submissionEndDate}`

      // given some form data
      const formData = {
        templateId,
        title,
        description,
        isPrivate,
        minTargetClaims,
        maxTargetClaims,
        goal,
        submissionDates,
      }

      // when ... we call the updateEntityClaimTemplate action
      const action = SUT.updateEntityClaimTemplate(entityClaimId, id, formData)

      // then ... we should expect it to edit an action with the correct type and payload
      expect(action.type).toEqual(
        EditEntityClaimsActions.UpdateEntityClaimTemplate,
      )
      expect(action.payload).toEqual({
        id,
        entityClaimId,
        templateId,
        title,
        description,
        isPrivate,
        minTargetClaims,
        maxTargetClaims,
        goal,
        submissionStartDate,
        submissionEndDate,
      })
    })
  })

  describe('entityClaimAgentRole', () => {
    describe('addEntityClaimAgentRole', () => {
      it('should edit an action to add a new agent role to the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'newId'
        v4.mockImplementationOnce(() => id)

        // when ... we call the addEntityClaimAgentRole action with an entityClaimId
        const action = SUT.addEntityClaimAgentRole(entityClaimId)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.AddEntityClaimAgentRole,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('removeEntityClaimAgentRole', () => {
      it('should edit an action to remove an agent role from the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'existingId'

        // when ... we call the removeEntityClaimAgentRole action
        const action = SUT.removeEntityClaimAgentRole(entityClaimId, id)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.RemoveEntityClaimAgentRole,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('updateEntityClaimAgentRole', () => {
      it('should edit an action to update an agent role in the relevant entity claim', () => {
        const id = 'existingId'
        const entityClaimId = 'someEntityClaimId'
        const role = 'someRole'
        const credential = 'someCredential'
        const autoApprove = true

        // given some form data
        const formData = {
          role,
          credential,
          autoApprove,
        }

        // when ... we call the updateEntityClaimAgentRole action
        const action = SUT.updateEntityClaimAgentRole(
          entityClaimId,
          id,
          formData,
        )

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.UpdateEntityClaimAgentRole,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
          role,
          credential,
          autoApprove,
        })
      })
    })
  })

  describe('entityClaimEvaluation', () => {
    describe('addEntityClaimEvaluation', () => {
      it('should edit an action to add a new evaluation to the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'newId'
        v4.mockImplementationOnce(() => id)

        // when ... we call the addEntityClaimEvaluation action with an entityClaimId
        const action = SUT.addEntityClaimEvaluation(entityClaimId)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.AddEntityClaimEvaluation,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('removeEntityClaimEvaluation', () => {
      it('should edit an action to remove an evaluation from the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'existingId'

        // when ... we call the removeEntityClaimEvaluation action
        const action = SUT.removeEntityClaimEvaluation(entityClaimId, id)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.RemoveEntityClaimEvaluation,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('updateEntityClaimEvaluation', () => {
      it('should edit an action to update an evaluation in the relevant entity claim', () => {
        const id = 'existingId'
        const entityClaimId = 'someEntityClaimId'
        const context = 'someContext'
        const contextLink = 'someContextLink'
        const evaluationAttributes = [
          'someEvaluationAttributes',
          'someOtherEvaluationAttributes',
        ]
        const evaluationMethodology = 'someEvaluationMethodology'

        // given some form data
        const formData = {
          context,
          contextLink,
          evaluationAttributes,
          evaluationMethodology,
        }

        // when ... we call the updateEntityClaimEvaluation action
        const action = SUT.updateEntityClaimEvaluation(
          entityClaimId,
          id,
          formData,
        )

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.UpdateEntityClaimEvaluation,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
          context,
          contextLink,
          evaluationAttributes,
          evaluationMethodology,
        })
      })
    })
  })

  describe('entityClaimApprovalCriterion', () => {
    describe('addEntityClaimApprovalCriterion', () => {
      it('should edit an action to add new approval criterion to the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'newId'
        v4.mockImplementationOnce(() => id)

        // when ... we call the addEntityClaimApprovalCriterion action with an entityClaimId
        const action = SUT.addEntityClaimApprovalCriterion(entityClaimId)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.AddEntityClaimApprovalCriterion,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('removeEntityClaimApprovalCriterion', () => {
      it('should edit an action to remove approval criterion from the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'existingId'

        // when ... we call the removeEntityClaimApprovalCriterion action
        const action = SUT.removeEntityClaimApprovalCriterion(entityClaimId, id)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.RemoveEntityClaimApprovalCriterion,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('updateEntityClaimApprovalCriterion', () => {
      it('should edit an action to update approval criterion in the relevant entity claim', () => {
        const id = 'existingId'
        const entityClaimId = 'someEntityClaimId'
        const context = 'someContext'
        const contextLink = 'someContextLink'
        const approvalAttributes = [
          {
            condition: 'someCondition1',
            attribute: 'someApprovalCriterionAttributes',
          },
          {
            condition: 'someCondition2',
            attribute: 'someOtherApprovalCriterionAttributes',
          },
        ]

        // given some form data
        const formData = {
          context,
          contextLink,
          approvalAttributes,
        }

        // when ... we call the updateEntityClaimApprovalCriterion action
        const action = SUT.updateEntityClaimApprovalCriterion(
          entityClaimId,
          id,
          formData,
        )

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.UpdateEntityClaimApprovalCriterion,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
          context,
          contextLink,
          approvalAttributes,
        })
      })
    })
  })

  describe('entityClaimEnrichment', () => {
    describe('addEntityClaimEnrichment', () => {
      it('should edit an action to add new enrichment to the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'newId'
        v4.mockImplementationOnce(() => id)

        // when ... we call the addEntityClaimEnrichment action with an entityClaimId
        const action = SUT.addEntityClaimEnrichment(entityClaimId)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.AddEntityClaimEnrichment,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('removeEntityClaimEnrichment', () => {
      it('should edit an action to remove enrichment from the relevant entity claim', () => {
        const entityClaimId = 'someEntityClaimId'
        const id = 'existingId'

        // when ... we call the removeEntityClaimEnrichment action
        const action = SUT.removeEntityClaimEnrichment(entityClaimId, id)

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.RemoveEntityClaimEnrichment,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
        })
      })
    })

    describe('updateEntityClaimEnrichment', () => {
      it('should edit an action to update enrichment in the relevant entity claim', () => {
        const id = 'existingId'
        const entityClaimId = 'someEntityClaimId'
        const context = 'someContext'
        const contextLink = 'someContextLink'
        const resources = [
          { productId: 'productId1', resource: 'someEnrichmentAttributes' },
          {
            productId: 'productId2',
            resource: 'someOtherEnrichmentAttributes',
          },
        ]

        // given some form data
        const formData = {
          context,
          contextLink,
          resources,
        }

        // when ... we call the updateEntityClaimEnrichment action
        const action = SUT.updateEntityClaimEnrichment(
          entityClaimId,
          id,
          formData,
        )

        // then ... we should expect it to edit an action with the correct type and payload
        expect(action.type).toEqual(
          EditEntityClaimsActions.UpdateEntityClaimEnrichment,
        )
        expect(action.payload).toEqual({
          entityClaimId,
          id,
          context,
          contextLink,
          resources,
        })
      })
    })
  })

  describe('validation', () => {
    it('should set validated to true', () => {
      const identifier = 'someIdentifier'
      // when ... we call the validated action creator
      const action = SUT.validated(identifier)

      // then ... we should expect it to edit an action with the correct type and payload
      expect(action.type).toEqual(EditEntityClaimsActions.Validated)
      expect(action.payload).toEqual({
        identifier,
      })
    })
  })
  describe('validationError', () => {
    it('should set validated to false with any errors', () => {
      const identifier = 'someIdentifier'
      const errors = ['error1', 'error2']
      // when ... we call the validated action creator
      const action = SUT.validationError(identifier, errors)

      // then ... we should expect it to edit an action with the correct type and payload
      expect(action.type).toEqual(EditEntityClaimsActions.ValidationError)
      expect(action.payload).toEqual({
        identifier,
        errors,
      })
    })
  })
})
