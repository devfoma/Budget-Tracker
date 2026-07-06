import * as Haptics from 'expo-haptics';

export function hapticTap() {
  void Haptics.selectionAsync();
}
