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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Defina uma nova senha de acesso — {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={marca}>CLUBE ANCESTRAL</Text>
        <Heading style={h1}>Definir minha senha</Heading>
        <Text style={text}>
          Recebemos um pedido de redefinição de senha para o seu acesso interno em {siteName}.
          Toque no botão abaixo para escolher uma nova senha.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Definir minha senha
        </Button>
        <Text style={contingenciaRotulo}>
          Se o botão não funcionar, copie e cole este endereço no navegador:
        </Text>
        <Link style={contingenciaLink} href={confirmationUrl}>
          {confirmationUrl}
        </Link>
        <Hr style={hr} />
        <Text style={footer}>
          Este link é de uso único e vale por 20 minutos. Se você não solicitou a
          redefinição, ignore este e-mail: sua senha permanece inalterada.
        </Text>

      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
  margin: '0 0 24px',
  fontFamily: 'Arial, sans-serif',
}
const button = {
  backgroundColor: '#1B2B4B',
  color: '#F5F0E8',
  fontSize: '15px',
  borderRadius: '4px',
  padding: '14px 24px',
  textDecoration: 'none',
  fontFamily: 'Arial, sans-serif',
  display: 'inline-block',
}
const contingenciaRotulo = {
  fontSize: '13px',
  color: '#8B4513',
  margin: '28px 0 6px',
  fontFamily: 'Arial, sans-serif',
}
const contingenciaLink = {
  fontSize: '13px',
  color: '#1B2B4B',
  wordBreak: 'break-all' as const,
  fontFamily: 'Arial, sans-serif',
}
const hr = { borderColor: '#F5F0E8', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#6b6b6b', margin: 0, fontFamily: 'Arial, sans-serif' }
