import React from 'react'
import { Entity } from '../types'
import { EntityCardWrapper, EntityTitle } from './EntityCard.styles'
import Eye from 'assets/icons/Eye'
import { Link } from 'react-router-dom'

interface Props {
  entity: Entity
  isSelected: boolean
}

const EntityCard: React.FunctionComponent<Props> = ({ entity, isSelected }) => {
  const { title, dateCreated, imageUrl, previewUrl } = entity
  console.log('gggggggggggggggg', entity)
  return (
    <EntityCardWrapper className={isSelected ? 'selected' : null}>
      {imageUrl && (
        <div className="image">
          <img src={imageUrl} alt={title} width="100%" />
        </div>
      )}
      <div className="info">
        <EntityTitle>{title}</EntityTitle>
        <div className="row mt-2">
          <div className="date col-sm-6">Created {dateCreated}</div>
          <div className="link col-sm-6 text-right" style={{ height: 0 }}>
            <Link to={`/projects/${entity.did}/overview`} target="_blank">
              <Eye fill="#39c3e6" width="30" />
            </Link>
          </div>
        </div>
      </div>
    </EntityCardWrapper>
  )
}

export default EntityCard
