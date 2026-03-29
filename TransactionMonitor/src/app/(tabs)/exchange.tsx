import { View, Text, StyleSheet } from 'react-native';

export default function ExchangeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Exchange Screen</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, text: { fontSize: 20 } });
