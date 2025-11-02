import { LazyImage } from '@/components/common'
import { apiClient } from '@/services'
import { IMAGE_SIZES } from '@/constants/api.constants'
import type { CastMember as CastMemberType } from '@/types'
import styles from './CastMember.module.scss'

export interface CastMemberProps {
  castMember: CastMemberType
}

export const CastMember = ({ castMember }: CastMemberProps) => {
  const profileUrl = apiClient.getImageURL(
    castMember.profile_path,
    IMAGE_SIZES.PROFILE.MEDIUM
  )

  return (
    <div className={styles.cast}>
      <div className={styles.cast__photo}>
        <LazyImage src={profileUrl} alt={castMember.name} aspectRatio="2/3" />
      </div>
      
      <div className={styles.cast__info}>
        <h4 className={styles.cast__name}>{castMember.name}</h4>
        <p className={styles.cast__character}>{castMember.character}</p>
      </div>
    </div>
  )
}

