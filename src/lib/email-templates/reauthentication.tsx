import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
    </Head>
    <Preview>Seu código de verificação</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={marca}>CLUBE ANCESTRAL</Text>
        <Heading style={h1}>Confirmar identidade</Heading>
        <Text style={text}>Use o código abaixo para confirmar sua identidade:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Hr style={hr} />
        <Text style={footer}>
          O código expira em poucos minutos. Se não foi você, ignore este e-mail.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#F5F0E8', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = {
  padding: '32px 28px',
  backgroundColor: '#ffffff',
  borderTop: '4px solid #C9A84C',
  maxWidth: '560px',
}
const marca = {
  fontSize: '12px',
  letterSpacing: '2px',
  color: '#C9A84C',
  margin: '0 0 18px',
  fontFamily: 'Arial, sans-serif',
}
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1B2B4B', margin: '0 0 18px' }
const text = {
  fontSize: '15px',
  color: '#1B2B4B',
  lineHeight: '1.6',
  margin: '0 0 16px',
  fontFamily: 'Arial, sans-serif',
}
const codeStyle = {
  fontSize: '30px',
  letterSpacing: '8px',
  fontWeight: 'bold' as const,
  color: '#1B2B4B',
  backgroundColor: '#F5F0E8',
  padding: '16px 20px',
  margin: '0 0 8px',
  fontFamily: 'Arial, sans-serif',
}
const hr = { borderColor: '#F5F0E8', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#6b6b6b', margin: 0, fontFamily: 'Arial, sans-serif' }
