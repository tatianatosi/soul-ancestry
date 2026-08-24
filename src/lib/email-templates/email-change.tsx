import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
    </Head>
    <Preview>Confirme a alteração de e-mail — {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={marca}>CLUBE ANCESTRAL</Text>
        <Heading style={h1}>Confirmar alteração de e-mail</Heading>
        <Text style={text}>
          Foi solicitada a alteração do e-mail de acesso em {siteName}, de {oldEmail} para{' '}
          {newEmail}. Confirme para concluir a mudança.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar alteração
        </Button>
        <Text style={contingenciaRotulo}>
          Se o botão não funcionar, copie e cole este endereço no navegador:
        </Text>
        <Link style={contingenciaLink} href={confirmationUrl}>
          {confirmationUrl}
        </Link>
        <Hr style={hr} />
        <Text style={footer}>
          Se você não solicitou esta alteração, ignore este e-mail: nada será alterado.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#F7F1E7', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = {
  padding: '32px 28px',
  backgroundColor: '#ffffff',
  borderTop: '4px solid #FCB73A',
  maxWidth: '560px',
}
const marca = {
  fontSize: '12px',
  letterSpacing: '2px',
  color: '#FCB73A',
  margin: '0 0 18px',
  fontFamily: 'Arial, sans-serif',
}
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#2F4B6E', margin: '0 0 18px' }
const text = {
  fontSize: '15px',
  color: '#2F4B6E',
  lineHeight: '1.6',
  margin: '0 0 24px',
  fontFamily: 'Arial, sans-serif',
}
const button = {
  backgroundColor: '#2F4B6E',
  color: '#FFFFFF',
  fontSize: '15px',
  borderRadius: '4px',
  padding: '14px 24px',
  textDecoration: 'none',
  fontFamily: 'Arial, sans-serif',
  display: 'inline-block',
}
const contingenciaRotulo = {
  fontSize: '13px',
  color: '#9A3A2F',
  margin: '28px 0 6px',
  fontFamily: 'Arial, sans-serif',
}
const contingenciaLink = {
  fontSize: '13px',
  color: '#2F4B6E',
  wordBreak: 'break-all' as const,
  fontFamily: 'Arial, sans-serif',
}
const hr = { borderColor: '#F7F1E7', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#6b6b6b', margin: 0, fontFamily: 'Arial, sans-serif' }
