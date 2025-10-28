import React from 'react'
import { StyleSheet, View } from 'react-native'

import Messages from './messages/Messages'
import { Assistant, Topic } from '@/types/assistant'

interface ChatContentProps {
  topic: Topic
  assistant: Assistant
}

const ChatContent = ({ topic, assistant }: ChatContentProps) => {
  return (
    <View style={styles.container}>
      <Messages assistant={assistant} topic={topic} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%'
  }
})

export default ChatContent
