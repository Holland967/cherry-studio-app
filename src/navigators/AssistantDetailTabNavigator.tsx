import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'

import { AssistantStackParamList } from '@/navigators/AssistantStackNavigator'
import ModelTabScreen from '@/screens/assistant/tabs/ModelTabScreen'
import PromptTabScreen from '@/screens/assistant/tabs/PromptTabScreen'
import ToolTabScreen from '@/screens/assistant/tabs/ToolTabScreen'
import { Assistant } from '@/types/assistant'
import { Text } from '@/componentsV2'
import { cn } from 'heroui-native'

export type AssistantDetailTabParamList = {
  PromptTab: { assistant: Assistant }
  ModelTab: { assistant: Assistant }
  ToolTab: { assistant: Assistant }
}

const Tab = createMaterialTopTabNavigator<AssistantDetailTabParamList>()

type AssistantDetailRouteProp = RouteProp<AssistantStackParamList, 'AssistantDetailScreen'>

interface AssistantDetailTabNavigatorProps {
  assistant: Assistant
}

function CustomTabBar({ state, navigation }: any) {
  const { t } = useTranslation()

  const tabLabels = {
    PromptTab: t('common.prompt'),
    ModelTab: t('common.model'),
    ToolTab: t('common.tool')
  }

  return (
    <View className="rounded-xl flex-row bg-transparent border border-neutral-300/20 mx-[5px] my-1 gap-[5px] py-1 px-[5px]">
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className={cn(
              'flex-1 rounded-lg py-3 px-5 items-center justify-center',
              isFocused && 'bg-green-20 dark:bg-green-dark-20'
            )}>
            <Text className={cn('text-sm font-bold', isFocused && 'text-green-100 dark:text-green-dark-100')}>
              {tabLabels[route.name as keyof typeof tabLabels]}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default function AssistantDetailTabNavigator({ assistant }: AssistantDetailTabNavigatorProps) {
  const { t } = useTranslation()
  const route = useRoute<AssistantDetailRouteProp>()
  const { tab } = route.params

  return (
    <Tab.Navigator
      initialRouteName={getInitialTabRoute(tab)}
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true
      }}>
      <Tab.Screen
        name="PromptTab"
        component={PromptTabScreen}
        options={{
          tabBarLabel: t('common.prompt')
        }}
        initialParams={{ assistant }}
      />
      <Tab.Screen
        name="ModelTab"
        component={ModelTabScreen}
        options={{
          tabBarLabel: t('common.model')
        }}
        initialParams={{ assistant }}
      />
      <Tab.Screen
        name="ToolTab"
        component={ToolTabScreen}
        options={{
          tabBarLabel: t('common.tool')
        }}
        initialParams={{ assistant }}
      />
    </Tab.Navigator>
  )
}

function getInitialTabRoute(tab?: string): keyof AssistantDetailTabParamList {
  switch (tab) {
    case 'prompt':
      return 'PromptTab'
    case 'model':
      return 'ModelTab'
    case 'tool':
      return 'ToolTab'
    default:
      return 'PromptTab'
  }
}
