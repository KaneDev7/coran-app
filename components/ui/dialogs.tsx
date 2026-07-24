import type { ComponentProps } from 'react'
import { ConfirmDialog as LibConfirmDialog } from 'react-native-simple-dialogs'

// Les types de `react-native-simple-dialogs` marquent `onRequestClose` et
// `contentInsetAdjustmentBehavior` comme requis, alors qu'ils sont
// optionnels à l'exécution. Ce wrapper fournit des valeurs par défaut et
// expose une API où ces props sont optionnelles.
type LibProps = ComponentProps<typeof LibConfirmDialog>
type ConfirmDialogProps = Omit<
  LibProps,
  'onRequestClose' | 'contentInsetAdjustmentBehavior'
> & {
  onRequestClose?: () => void
  contentInsetAdjustmentBehavior?: LibProps['contentInsetAdjustmentBehavior']
}

export function ConfirmDialog({
  onRequestClose,
  contentInsetAdjustmentBehavior = 'never',
  ...rest
}: ConfirmDialogProps) {
  return (
    <LibConfirmDialog
      {...rest}
      contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
      onRequestClose={onRequestClose ?? rest.onTouchOutside ?? (() => {})}
    />
  )
}
