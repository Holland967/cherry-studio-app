import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Copy } from '@tamagui/lucide-icons'
import * as Clipboard from 'expo-clipboard'
import React, { forwardRef, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Separator, Text, View, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { getHttpMessageLabel } from '@/i18n/label'
import {
  isSerializedAiSdkAPICallError,
  isSerializedAiSdkDownloadError,
  isSerializedAiSdkError,
  isSerializedAiSdkErrorUnion,
  isSerializedAiSdkInvalidArgumentError,
  isSerializedAiSdkInvalidDataContentError,
  isSerializedAiSdkInvalidMessageRoleError,
  isSerializedAiSdkInvalidPromptError,
  isSerializedAiSdkInvalidToolInputError,
  isSerializedAiSdkJSONParseError,
  isSerializedAiSdkMessageConversionError,
  isSerializedAiSdkNoObjectGeneratedError,
  isSerializedAiSdkNoSpeechGeneratedError,
  isSerializedAiSdkNoSuchModelError,
  isSerializedAiSdkNoSuchProviderError,
  isSerializedAiSdkNoSuchToolError,
  isSerializedAiSdkRetryError,
  isSerializedAiSdkToolCallRepairError,
  isSerializedAiSdkTooManyEmbeddingValuesForCallError,
  isSerializedAiSdkTypeValidationError,
  isSerializedAiSdkUnsupportedFunctionalityError,
  isSerializedError,
  SerializedAiSdkError,
  SerializedAiSdkErrorUnion,
  SerializedError
} from '@/types/error'
import { ErrorMessageBlock, Message } from '@/types/message'
import { formatAiSdkError, formatError, safeToString } from '@/utils/error'

const HTTP_ERROR_CODES = [400, 401, 403, 404, 429, 500, 502, 503, 504]

interface Props {
  block: ErrorMessageBlock
  message: Message
}

const ErrorBlock: React.FC<Props> = ({ block, message }) => {
  const sheetRef = useRef<BottomSheetModal>(null)

  const handleShowDetail = useCallback(() => {
    sheetRef.current?.present()
  }, [])

  return (
    <>
      <MessageErrorInfo block={block} message={message} onShowDetail={handleShowDetail} />
      <ErrorDetailSheet ref={sheetRef} error={block.error} />
    </>
  )
}

const ErrorMessage: React.FC<{ block: ErrorMessageBlock }> = ({ block }) => {
  const { t, i18n } = useTranslation()

  const i18nKey = block.error && 'i18nKey' in block.error ? `error.${block.error?.i18nKey}` : ''
  const errorKey = `error.${block.error?.message}`
  const errorStatus =
    block.error && ('status' in block.error || 'statusCode' in block.error)
      ? block.error?.status || block.error?.statusCode
      : undefined

  if (i18n.exists(i18nKey)) {
    const providerId = block.error && 'providerId' in block.error ? block.error?.providerId : undefined

    if (providerId && typeof providerId === 'string') {
      return (
        <></>
        // <Trans
        //   i18nKey={i18nKey}
        //   values={{ provider: getProviderLabel(providerId) }}
        //   components={{
        //     provider: (
        //       <Link
        //         style={{ color: 'var(--color-link)' }}
        //         to={`/settings/provider`}
        //         state={{ provider: getProviderById(providerId) }}
        //       />
        //     )
        //   }}
        // />
      )
    }
  }

  if (i18n.exists(errorKey)) {
    return t(errorKey)
  }

  if (typeof errorStatus === 'number' && HTTP_ERROR_CODES.includes(errorStatus)) {
    return (
      <h5>
        {getHttpMessageLabel(errorStatus.toString())} {block.error?.message}
      </h5>
    )
  }

  return block.error?.message || ''
}

const MessageErrorInfo: React.FC<{ block: ErrorMessageBlock; message: Message; onShowDetail: () => void }> = ({
  block,
  message,
  onShowDetail
}) => {
  const { t } = useTranslation()

  const getAlertDescription = () => {
    const status =
      block.error && ('status' in block.error || 'statusCode' in block.error)
        ? block.error?.status || block.error?.statusCode
        : undefined

    if (block.error && typeof status === 'number' && HTTP_ERROR_CODES.includes(status)) {
      return getHttpMessageLabel(status.toString())
    }

    return <ErrorMessage block={block} />
  }

  return (
    <Button
      size="$5"
      backgroundColor="$red2"
      borderColor="$red5"
      borderWidth={1}
      pressStyle={{ backgroundColor: '$red3' }}
      onPress={onShowDetail}>
      <XStack justifyContent="space-between" width="100%" alignItems="center">
        <Text flex={1} numberOfLines={1} color="$red11">
          {getAlertDescription()}
        </Text>
        <Text color="$red10" fontSize="$3">
          {t('common.detail')}
        </Text>
      </XStack>
    </Button>
  )
}

interface ErrorDetailSheetProps {
  error?: SerializedError
}

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
)

const ErrorDetailSheet = forwardRef<BottomSheetModal, ErrorDetailSheetProps>(({ error }, ref) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [copiedText, setCopiedText] = useState(false)

  const copyErrorDetails = async () => {
    if (!error) return
    let errorText: string

    if (isSerializedAiSdkError(error)) {
      errorText = formatAiSdkError(error)
    } else if (isSerializedError(error)) {
      errorText = formatError(error)
    } else {
      errorText = safeToString(error)
    }

    await Clipboard.setStringAsync(errorText)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  const renderErrorDetails = (error?: SerializedError) => {
    if (!error) return <Text>{t('error.unknown')}</Text>

    if (isSerializedAiSdkErrorUnion(error)) {
      return <AiSdkError error={error} />
    }

    return <BuiltinError error={error} />
  }

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      snapPoints={['50%', '75%', '90%']}
      backgroundStyle={{
        borderRadius: 30,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}>
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal={20} paddingTop={10} gap={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$6" fontWeight="600">
              {t('error.detail')}
            </Text>
            <Button size="$3" icon={Copy} onPress={copyErrorDetails} variant="outlined" disabled={!error}>
              {copiedText ? t('common.copied') : t('common.copy')}
            </Button>
          </XStack>
          <Separator />
          {renderErrorDetails(error)}
        </YStack>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})

ErrorDetailSheet.displayName = 'ErrorDetailSheet'

// Error detail components
const ErrorDetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <YStack gap={8}>
      <Text fontSize="$3" fontWeight="600" color="$color11">
        {label}:
      </Text>
      {children}
    </YStack>
  )
}

const ErrorDetailValue: React.FC<{ children: React.ReactNode; isCode?: boolean }> = ({ children, isCode = false }) => {
  const { isDark } = useTheme()
  return (
    <View
      backgroundColor={isDark ? '$gray2' : '$gray3'}
      borderRadius="$2"
      padding="$2"
      borderWidth={1}
      borderColor={isDark ? '$gray5' : '$gray6'}>
      <Text fontSize="$2" fontFamily={isCode ? '$mono' : '$body'} color="$color12" style={{ wordBreak: 'break-word' }}>
        {children}
      </Text>
    </View>
  )
}

const StackTrace: React.FC<{ stack: string }> = ({ stack }) => {
  const { isDark } = useTheme()
  return (
    <View
      backgroundColor={isDark ? '$red2' : '$red3'}
      borderRadius="$2"
      padding="$3"
      borderWidth={1}
      borderColor="$red8">
      <Text fontSize="$2" fontFamily="$mono" color="$red11" style={{ lineHeight: 20 }}>
        {stack}
      </Text>
    </View>
  )
}

const JsonViewer: React.FC<{ data: any }> = ({ data }) => {
  const { isDark } = useTheme()
  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        backgroundColor={isDark ? '$gray2' : '$gray3'}
        borderRadius="$2"
        padding="$2"
        borderWidth={1}
        borderColor={isDark ? '$gray5' : '$gray6'}>
        <Text fontSize="$2" fontFamily="$mono" color="$color12">
          {formatted}
        </Text>
      </View>
    </ScrollView>
  )
}

const BuiltinError = ({ error }: { error: SerializedError }) => {
  const { t } = useTranslation()
  return (
    <YStack gap={16}>
      {error.name && (
        <ErrorDetailItem label={t('error.name')}>
          <ErrorDetailValue>{error.name}</ErrorDetailValue>
        </ErrorDetailItem>
      )}
      {error.message && (
        <ErrorDetailItem label={t('error.message')}>
          <ErrorDetailValue>{error.message}</ErrorDetailValue>
        </ErrorDetailItem>
      )}
      {error.stack && (
        <ErrorDetailItem label={t('error.stack')}>
          <StackTrace stack={error.stack} />
        </ErrorDetailItem>
      )}
    </YStack>
  )
}

const AiSdkErrorBase = ({ error }: { error: SerializedAiSdkError }) => {
  const { t } = useTranslation()
  return (
    <YStack gap={16}>
      <BuiltinError error={error} />
      {error.cause && (
        <ErrorDetailItem label={t('error.cause')}>
          <ErrorDetailValue>{error.cause}</ErrorDetailValue>
        </ErrorDetailItem>
      )}
    </YStack>
  )
}

const AiSdkError = ({ error }: { error: SerializedAiSdkErrorUnion }) => {
  const { t } = useTranslation()

  return (
    <YStack gap={16}>
      <AiSdkErrorBase error={error} />

      {(isSerializedAiSdkAPICallError(error) || isSerializedAiSdkDownloadError(error)) && (
        <>
          {error.statusCode && (
            <ErrorDetailItem label={t('error.statusCode')}>
              <ErrorDetailValue>{error.statusCode}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.url && (
            <ErrorDetailItem label={t('error.requestUrl')}>
              <ErrorDetailValue>{error.url}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {isSerializedAiSdkAPICallError(error) && (
        <>
          {error.requestBodyValues && (
            <ErrorDetailItem label={t('error.requestBodyValues')}>
              <JsonViewer data={error.requestBodyValues} />
            </ErrorDetailItem>
          )}

          {error.responseHeaders && (
            <ErrorDetailItem label={t('error.responseHeaders')}>
              <JsonViewer data={error.responseHeaders} />
            </ErrorDetailItem>
          )}

          {error.responseBody && (
            <ErrorDetailItem label={t('error.responseBody')}>
              <JsonViewer data={error.responseBody} />
            </ErrorDetailItem>
          )}

          {error.data && (
            <ErrorDetailItem label={t('error.data')}>
              <JsonViewer data={error.data} />
            </ErrorDetailItem>
          )}
        </>
      )}

      {isSerializedAiSdkDownloadError(error) && (
        <>
          {error.statusText && (
            <ErrorDetailItem label={t('error.statusText')}>
              <ErrorDetailValue>{error.statusText}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {isSerializedAiSdkInvalidArgumentError(error) && (
        <>
          {error.parameter && (
            <ErrorDetailItem label={t('error.parameter')}>
              <ErrorDetailValue>{error.parameter}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {(isSerializedAiSdkInvalidArgumentError(error) || isSerializedAiSdkTypeValidationError(error)) && (
        <>
          {error.value && (
            <ErrorDetailItem label={t('error.value')}>
              <ErrorDetailValue>{safeToString(error.value)}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {isSerializedAiSdkInvalidDataContentError(error) && (
        <ErrorDetailItem label={t('error.content')}>
          <ErrorDetailValue>{safeToString(error.content)}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkInvalidMessageRoleError(error) && (
        <ErrorDetailItem label={t('error.role')}>
          <ErrorDetailValue>{error.role}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkInvalidPromptError(error) && (
        <ErrorDetailItem label={t('error.prompt')}>
          <ErrorDetailValue>{safeToString(error.prompt)}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkInvalidToolInputError(error) && (
        <>
          {error.toolName && (
            <ErrorDetailItem label={t('error.toolName')}>
              <ErrorDetailValue>{error.toolName}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.toolInput && (
            <ErrorDetailItem label={t('error.toolInput')}>
              <ErrorDetailValue>{error.toolInput}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {(isSerializedAiSdkJSONParseError(error) || isSerializedAiSdkNoObjectGeneratedError(error)) && (
        <ErrorDetailItem label={t('error.text')}>
          <ErrorDetailValue>{error.text}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkMessageConversionError(error) && (
        <ErrorDetailItem label={t('error.originalMessage')}>
          <ErrorDetailValue>{safeToString(error.originalMessage)}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkNoSpeechGeneratedError(error) && (
        <ErrorDetailItem label={t('error.responses')}>
          <ErrorDetailValue>{error.responses.join(', ')}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkNoObjectGeneratedError(error) && (
        <>
          {error.response && (
            <ErrorDetailItem label={t('error.response')}>
              <ErrorDetailValue>{safeToString(error.response)}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.usage && (
            <ErrorDetailItem label={t('error.usage')}>
              <ErrorDetailValue>{safeToString(error.usage)}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.finishReason && (
            <ErrorDetailItem label={t('error.finishReason')}>
              <ErrorDetailValue>{error.finishReason}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {(isSerializedAiSdkNoSuchModelError(error) ||
        isSerializedAiSdkNoSuchProviderError(error) ||
        isSerializedAiSdkTooManyEmbeddingValuesForCallError(error)) && (
        <ErrorDetailItem label={t('error.modelId')}>
          <ErrorDetailValue>{error.modelId}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {(isSerializedAiSdkNoSuchModelError(error) || isSerializedAiSdkNoSuchProviderError(error)) && (
        <ErrorDetailItem label={t('error.modelType')}>
          <ErrorDetailValue>{error.modelType}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkNoSuchProviderError(error) && (
        <>
          <ErrorDetailItem label={t('error.providerId')}>
            <ErrorDetailValue>{error.providerId}</ErrorDetailValue>
          </ErrorDetailItem>

          <ErrorDetailItem label={t('error.availableProviders')}>
            <ErrorDetailValue>{error.availableProviders.join(', ')}</ErrorDetailValue>
          </ErrorDetailItem>
        </>
      )}

      {isSerializedAiSdkNoSuchToolError(error) && (
        <>
          <ErrorDetailItem label={t('error.toolName')}>
            <ErrorDetailValue>{error.toolName}</ErrorDetailValue>
          </ErrorDetailItem>
          {error.availableTools && (
            <ErrorDetailItem label={t('error.availableTools')}>
              <ErrorDetailValue>{error.availableTools?.join(', ') || t('common.none')}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {isSerializedAiSdkRetryError(error) && (
        <>
          {error.reason && (
            <ErrorDetailItem label={t('error.reason')}>
              <ErrorDetailValue>{error.reason}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.lastError && (
            <ErrorDetailItem label={t('error.lastError')}>
              <ErrorDetailValue>{safeToString(error.lastError)}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.errors && error.errors.length > 0 && (
            <ErrorDetailItem label={t('error.errors')}>
              <ErrorDetailValue>{error.errors.map(e => safeToString(e)).join('\n\n')}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {isSerializedAiSdkTooManyEmbeddingValuesForCallError(error) && (
        <>
          {error.provider && (
            <ErrorDetailItem label={t('error.provider')}>
              <ErrorDetailValue>{error.provider}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.maxEmbeddingsPerCall && (
            <ErrorDetailItem label={t('error.maxEmbeddingsPerCall')}>
              <ErrorDetailValue>{error.maxEmbeddingsPerCall}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
          {error.values && (
            <ErrorDetailItem label={t('error.values')}>
              <ErrorDetailValue>{safeToString(error.values)}</ErrorDetailValue>
            </ErrorDetailItem>
          )}
        </>
      )}

      {isSerializedAiSdkToolCallRepairError(error) && (
        <ErrorDetailItem label={t('error.originalError')}>
          <ErrorDetailValue>{safeToString(error.originalError)}</ErrorDetailValue>
        </ErrorDetailItem>
      )}

      {isSerializedAiSdkUnsupportedFunctionalityError(error) && (
        <ErrorDetailItem label={t('error.functionality')}>
          <ErrorDetailValue>{error.functionality}</ErrorDetailValue>
        </ErrorDetailItem>
      )}
    </YStack>
  )
}

export default React.memo(ErrorBlock)
