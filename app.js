import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Platform,
} from 'react-native';

// DEMO DATA ONLY. Replace with a real backend + licensed payment partner.
const RATES = { NGN: 1650, GHS: 15.2, KES: 129, INR: 90 }; // per 1 EUR
const FEE = 1.99;

const C = {
  bg: '#0E2A2B', card: '#F6F1E7', ink: '#102022',
  gold: '#F2B33D', mute: '#6B7F80', white: '#FFFFFF',
};

export default function App() {
  const [step, setStep] = useState('login'); // login | home | recipient | review | done
  const [mode, setMode] = useState('signup'); // signup | signin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // DEMO ONLY: this checks the form but does not create a real account.
  // Next step is a real backend (e.g. Supabase or Firebase Auth).
  const submitAuth = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setAuthError('Enter a valid email address.');
    if (password.length < 8) return setAuthError('Use a password with at least 8 characters.');
    setAuthError('');
    setStep('dash');
  };
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('NGN');
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');

  const sendAmt = parseFloat(amount) || 0;
  const receive = Math.max(sendAmt - FEE, 0) * RATES[currency];
  const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Logo />
          <Text style={s.brand}>MicJos Monie</Text>
        </View>

        {step === 'login' && (
          <>
            <Text style={s.h1}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </Text>
            <View style={s.card}>
              <Text style={s.label}>Email</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              <Text style={s.label}>Password</Text>
              <TextInput style={s.input} value={password} onChangeText={setPassword}
                secureTextEntry autoCapitalize="none" />
              {!!authError && <Text style={s.error}>{authError}</Text>}
            </View>
            <Btn label={mode === 'signup' ? 'Create account' : 'Log in'} onPress={submitAuth} />
            <Link
              label={mode === 'signup' ? 'I already have an account' : 'Create a new account'}
              onPress={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setAuthError(''); }}
            />
          </>
        )}

        {step === 'dash' && (
          <>
            <Text style={s.h1}>What would you like to do?</Text>
            <Text style={s.p}>Move money between Europe and Africa.</Text>
            <View style={{ flexDirection: 'row', marginBottom: 24 }}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Btn label="Send money" onPress={() => setStep('home')} />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Btn outline label="Receive money" onPress={() => setStep('receive')} />
              </View>
            </View>
            <Text style={s.h2}>Recent transfers</Text>
            <View style={s.card}>
              <Text style={s.small}>No transfers yet. Your sent money will show here.</Text>
            </View>
            <Link label="Log out" onPress={() => { setPassword(''); setStep('login'); }} />
          </>
        )}

        {step === 'receive' && (
          <>
            <Text style={s.h1}>Receive money</Text>
            <Text style={s.p}>Share these details so someone can send you money.</Text>
            <View style={s.card}>
              <Line k="Account name" v="[YOUR NAME]" />
              <Line k="Account number" v="[ACCOUNT NUMBER]" />
              <Line k="Bank" v="[PARTNER BANK]" />
              <Text style={s.small}>
                Real details appear after ID verification and a payment partner is connected.
              </Text>
            </View>
            <Link label="Back" onPress={() => setStep('dash')} />
          </>
        )}

        {step === 'home' && (
          <>
            <Text style={s.h1}>Send money home, fast.</Text>
            <View style={s.card}>
              <Text style={s.label}>You send (EUR)</Text>
              <TextInput style={s.input} value={amount} onChangeText={setAmount}
                keyboardType="decimal-pad" />
              <Text style={s.label}>They receive in</Text>
              <View style={s.row}>
                {Object.keys(RATES).map((c) => (
                  <TouchableOpacity key={c} onPress={() => setCurrency(c)}
                    style={[s.chip, currency === c && s.chipOn]}>
                    <Text style={[s.chipTx, currency === c && s.chipTxOn]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.big}>{fmt(receive)} {currency}</Text>
              <Text style={s.small}>
                Rate 1 EUR = {RATES[currency]} {currency} · Fee €{FEE} (demo values)
              </Text>
            </View>
            <Btn label="Continue" onPress={() => setStep('recipient')} disabled={sendAmt <= FEE} />
            <Link label="Back" onPress={() => setStep('dash')} />
          </>
        )}

        {step === 'recipient' && (
          <>
            <Text style={s.h1}>Who is receiving?</Text>
            <View style={s.card}>
              <Text style={s.label}>Full name</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} />
              <Text style={s.label}>Bank account or mobile money number</Text>
              <TextInput style={s.input} value={account} onChangeText={setAccount}
                keyboardType="number-pad" />
            </View>
            <Btn label="Review transfer" onPress={() => setStep('review')}
              disabled={!name.trim() || account.length < 6} />
            <Link label="Back" onPress={() => setStep('home')} />
          </>
        )}

        {step === 'review' && (
          <>
            <Text style={s.h1}>Check and confirm</Text>
            <View style={s.card}>
              <Line k="You send" v={`€${fmt(sendAmt)}`} />
              <Line k="Fee" v={`€${FEE}`} />
              <Line k="They receive" v={`${fmt(receive)} ${currency}`} />
              <Line k="Recipient" v={name} />
              <Line k="Account" v={account} />
            </View>
            <Btn label="Confirm (demo)" onPress={() => setStep('done')} />
            <Link label="Back" onPress={() => setStep('recipient')} />
          </>
        )}

        {step === 'done' && (
          <>
            <Text style={s.h1}>Transfer created (demo)</Text>
            <Text style={s.p}>
              No real money moved. Next step is connecting sign-up, ID checks and a
              licensed payment provider.
            </Text>
            <Btn label="Back to home" onPress={() => { setStep('dash'); setName(''); setAccount(''); }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Logo built from plain views so no extra packages are needed.
const Logo = ({ size = 44 }) => (
  <View style={{ width: size, height: size, borderRadius: size * 0.22,
    backgroundColor: '#17403F', alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.68, height: size * 0.68, borderRadius: size,
      backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.bg, fontSize: size * 0.4, fontWeight: '900' }}>M</Text>
    </View>
  </View>
);

const Btn = ({ label, onPress, disabled, outline }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled}
    style={[s.btn, outline && s.btnOut, disabled && { opacity: 0.4 }]}>
    <Text style={[s.btnTx, outline && { color: C.gold }]}>{label}</Text>
  </TouchableOpacity>
);
const Link = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ padding: 14 }}>
    <Text style={{ color: C.white, textAlign: 'center' }}>{label}</Text>
  </TouchableOpacity>
);
const Line = ({ k, v }) => (
  <View style={[s.row, { justifyContent: 'space-between', paddingVertical: 8 }]}>
    <Text style={s.small}>{k}</Text>
    <Text style={{ color: C.ink, fontWeight: '600' }}>{v}</Text>
  </View>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  body: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  brand: { color: C.white, fontSize: 20, fontWeight: '800', marginLeft: 12 },
  h1: { color: C.white, fontSize: 32, fontWeight: '800', marginBottom: 20 },
  p: { color: C.white, fontSize: 16, lineHeight: 24, marginBottom: 24 },
  card: { backgroundColor: C.card, borderRadius: 18, padding: 18, marginBottom: 20 },
  label: { color: C.mute, fontSize: 13, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: C.white, borderRadius: 10, padding: 14, fontSize: 18, color: C.ink },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1,
    borderColor: C.mute, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipTx: { color: C.ink, fontWeight: '600' },
  chipTxOn: { color: C.white },
  big: { color: C.ink, fontSize: 30, fontWeight: '800', marginTop: 12 },
  small: { color: C.mute, fontSize: 13, marginTop: 6 },
  error: { color: '#B3261E', fontSize: 14, marginTop: 10 },
  h2: { color: C.white, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  btnOut: { backgroundColor: 'transparent', borderWidth: 2, borderColor: C.gold },
  btn: { backgroundColor: C.gold, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnTx: { color: C.ink, fontSize: 17, fontWeight: '800' },
});
