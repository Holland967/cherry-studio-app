import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { RestoreStep } from '@/components/settings/data/RestoreProgressModal'
import { useDialog } from '@/hooks/useDialog'
import { ProgressUpdate, restore, RestoreStepId } from '@/services/BackupService'
import { loggerService } from '@/services/LoggerService'
import { FileMetadata } from '@/types/file'
import { uuid } from '@/utils'
import { getFileType } from '@/utils/file'
const logger = loggerService.withContext('useRestore')

// 定义步骤配置类型
export interface StepConfig {
  id: RestoreStepId
  titleKey: string
}

// 预定义的步骤配置
export const RESTORE_STEP_CONFIGS = {
  // 公共步骤
  RESTORE_TOPICS: { id: 'restore_topics' as RestoreStepId, titleKey: 'settings.data.restore.steps.restore_topics' },
  RESTORE_MESSAGES_BLOCKS: {
    id: 'restore_messages_blocks' as RestoreStepId,
    titleKey: 'settings.data.restore.steps.restore_messages_blocks'
  },
  RESTORE_LLM_PROVIDERS: {
    id: 'restore_llm_providers' as RestoreStepId,
    titleKey: 'settings.data.restore.steps.restore_llm_providers'
  },
  RESTORE_ASSISTANTS: {
    id: 'restore_assistants' as RestoreStepId,
    titleKey: 'settings.data.restore.steps.restore_assistants'
  },
  RESTORE_WEBSEARCH: {
    id: 'restore_websearch' as RestoreStepId,
    titleKey: 'settings.data.restore.steps.restore_websearch'
  }
} as const

// 预定义的步骤组合
export const DEFAULT_RESTORE_STEPS: StepConfig[] = [
  RESTORE_STEP_CONFIGS.RESTORE_LLM_PROVIDERS,
  RESTORE_STEP_CONFIGS.RESTORE_ASSISTANTS,
  RESTORE_STEP_CONFIGS.RESTORE_WEBSEARCH,
  RESTORE_STEP_CONFIGS.RESTORE_TOPICS,
  RESTORE_STEP_CONFIGS.RESTORE_MESSAGES_BLOCKS
]

export const LOCAL_RESTORE_STEPS: StepConfig[] = [...DEFAULT_RESTORE_STEPS]

export const NETWORK_RESTORE_STEPS: StepConfig[] = [...DEFAULT_RESTORE_STEPS]

const createStepsFromConfig = (stepConfigs: StepConfig[], t: (key: string) => string): RestoreStep[] => {
  return stepConfigs.map(config => ({
    id: config.id,
    title: t(config.titleKey),
    status: 'pending' as const
  }))
}

export interface UseRestoreOptions {
  stepConfigs?: StepConfig[]
  customRestoreFunction?: (
    file: Omit<FileMetadata, 'md5'>,
    onProgress: (update: ProgressUpdate) => void
  ) => Promise<void>
}

export function useRestore(options: UseRestoreOptions = {}) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const dialog = useDialog()

  const { stepConfigs = DEFAULT_RESTORE_STEPS, customRestoreFunction = restore } = options

  const [isModalOpen, setModalOpen] = useState(false)
  const [restoreSteps, setRestoreSteps] = useState<RestoreStep[]>(createStepsFromConfig(stepConfigs, t))
  const [overallStatus, setOverallStatus] = useState<'running' | 'success' | 'error'>('running')

  const validateFile = (file: { mimeType?: string; name: string; type?: string }) => {
    const isValid = file.name.includes('cherry-studio')

    if (!isValid) {
      dialog.open({
        type: 'error',
        title: t('error.backup.title'),
        content: t('error.backup.file_invalid')
      })
      return false
    }

    return true
  }

  const createFileObject = (file: {
    name: string
    uri: string
    size?: number
    mimeType?: string
    type?: string
  }): Omit<FileMetadata, 'md5'> => ({
    id: uuid(),
    name: file.name,
    origin_name: file.name,
    path: file.uri,
    size: file.size || 0,
    ext: file.name.split('.').pop() || '',
    type: getFileType(file.name.split('.').pop() || ''),
    created_at: new Date().toISOString(),
    count: 1
  })

  const handleProgressUpdate = (update: ProgressUpdate) => {
    logger.info('handleProgressUpdate called:', update.step, update.status)
    setRestoreSteps(prevSteps => {
      const newSteps = prevSteps.map(step =>
        step.id === update.step ? { ...step, status: update.status, error: update.error } : step
      )
      logger.info('State updated for step:', update.step, 'new status:', update.status)
      return newSteps
    })
  }

  const handleError = () => {
    setOverallStatus('error')
    setRestoreSteps(prevSteps => {
      const errorStepIndex = prevSteps.findIndex(step => step.status === 'in_progress')

      if (errorStepIndex > -1) {
        const newSteps = [...prevSteps]
        newSteps[errorStepIndex] = { ...newSteps[errorStepIndex], status: 'error' }
        return newSteps
      }

      return prevSteps
    })
  }

  const startRestore = async (file: { name: string; uri: string; size?: number; mimeType?: string }) => {
    if (!validateFile(file)) return

    // 重置状态并打开模态框
    setRestoreSteps(createStepsFromConfig(stepConfigs, t))
    setOverallStatus('running')
    setModalOpen(true)

    // Use setTimeout to ensure the modal renders before starting the restore process
    setTimeout(async () => {
      try {
        const fileObject = createFileObject(file)
        await customRestoreFunction(fileObject, handleProgressUpdate, dispatch)
        setOverallStatus('success')
      } catch (err) {
        logger.error('Error during restore process:', err)
        handleError()
      }
    }, 400)
  }

  return {
    isModalOpen,
    restoreSteps,
    overallStatus,
    startRestore,
    closeModal: () => setModalOpen(false)
  }
}
