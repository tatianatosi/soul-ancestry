# Implementação de Correções — 27 de Agosto, 2026

**Resumo executivo:** Três blocos de problemas foram endereçados:
1. Configuração do Supabase (erro crítico)
2. Sistema de alertas WhatsApp para descobertas
3. Inventário de telas de governança para arquivamento

---

## 1. Supabase Project Mismatch (Crítico ⚠️)

### O Problema
O arquivo `.env` estava apontando para o projeto demo (`liiqqibnirnpnvjmjrpj`) em vez do projeto real (`zsxpdbhdvbuulwpepemd`). Isso significa:
- Todas as queries RLS estavam falhando silenciosamente
- O banco de dados estava vazio (dados de demo)
- Nenhum cliente/caso/descoberta era visível

### A Solução
Atualizar as variáveis de ambiente no **Vercel** (não localmente).

**Passos:**

1. Abra o [Vercel Dashboard](https://vercel.com)
2. Vá para seu projeto `soul-ancestry`
3. Clique em **Settings** → **Environment Variables**
4. Atualize (ou crie) estas variáveis com os valores do seu projeto Supabase real (`zsxpdbhdvbuulwpepemd`):

```
VITE_SUPABASE_URL="https://zsxpdbhdvbuulwpepemd.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="[copie do Supabase]"
SUPABASE_URL="https://zsxpdbhdvbuulwpepemd.supabase.co"
SUPABASE_PUBLISHABLE_KEY="[copie do Supabase]"
```

**Como obter a Publishable Key:**
1. Abra [Supabase Dashboard](https://app.supabase.com)
2. Selecione projeto `zsxpdbhdvbuulwpepemd`
3. Vá para **Project Settings** → **API** → **Project API Keys**
4. Copie a chave `anon / public`

5. **Depois de atualizar**, faça deploy no Vercel (ou ele detectará automaticamente as mudanças)

✅ **Resultado esperado:** Todas as queries RLS funcionarão, e você verá dados reais de Ana Luiza, leads, etc.

---

## 2. Testando o Demo como Staff

### A Situação
Você mencionou "algumas abas estão erradas" no demo do cliente. Você pode testar isso agora:

**Rota:** `/app-cliente-demo` (enquanto logado como staff)

Esta tela mostra exatamente o que os clientes veem, com dados fictícios. É útil para:
- ✓ Verificar se as 3 abas (Jornada, Árvore, Radar) renderizam corretamente
- ✓ Testar responsividade
- ✓ Identificar erros de UI/tipografia

**Checklist rápido:**
- [ ] Jornada: marcos em ordem cronológica?
- [ ] Árvore: gerações renderizam?
- [ ] Radar: países listam corretamente?
- [ ] Nenhuma página branca/erro?

---

## 3. Governança — Qual Tela Arquivar?

### O Inventário
Identificadas **18 telas** de governança. Delas:

- **15 são estáticas** (leem de constantes, sem lógica dinâmica)
  - Exemplos: Modelos Contratuais, Inventário Patrimonial, Matriz de Conformidade, etc.
  - **Recomendação:** Arquivar (move para docs offline, remove do menu)

- **3 são dinâmicas** (consultam banco de dados vivo)
  - Varredura de Completude
  - Varredura de Autorizações
  - Varredura de Administração
  - **Recomendação:** Manter

**Documento completo:** `/docs/governanca/TELAS_INVENTARIO.md`

**Próxima ação:** Você quer prosseguir com o arquivo das 15 telas estáticas? Se sim:
1. Semana 1: Documentar como MDX
2. Semana 2: Remover rotas/componentes
3. Semana 3: Testes

---

## 4. Alertas de WhatsApp para Descobertas

### Nova Funcionalidade
Agora você tem um sistema para notificar clientes quando uma descoberta é registrada.

**Arquivos adicionados:**
- `src/lib/alertas-whatsapp.ts` — Gerador de templates
- `src/components/caso/descobertas-alertas.tsx` — UI para staff

### Como Usar (Para o Caso Ana Luiza)

1. **Registre a descoberta** (no fluxo normal do caso)
   - Type: "país" | "geração" | "linha" | "documentos"
   - Description: "Encontramos registro de nascimento de..."
   - Evidence: "Certidão #123456, cartório de..."

2. **Acesse o caso** → Seção "Descobertas"

3. **Você verá:**
   - Card com a descoberta
   - Checklist pré-envio (validação jurídica? cliente confirmado?)
   - Botão "Copiar template" (copia texto para WhatsApp manual)
   - Botão "Enviar via WhatsApp" (será integrado com API depois)

4. **Por enquanto:**
   - Clique em "Copiar template"
   - Cole no WhatsApp manualmente
   - (Próxima versão: envio automático)

**Exemplo de template gerado:**
```
Olá Ana Luiza! 🎉

Encontramos um novo país sobre seu ancestral.

Detalhes:
Localizado registro de nascimento...

Prova:
Certidão de nascimento #123456...

A equipe está revisando. Você acompanha tudo em seu painel.
```

---

## 5. Resumo das Próximas Ações

| Item | Status | Próximo Passo |
|------|--------|--------------|
| **Supabase Config** | 🔴 Crítico | Atualizar variáveis no Vercel |
| **Demo Testing** | ✅ Pronto | Visite `/app-cliente-demo` para conferir abas |
| **Governança Archive** | 📋 Documentado | Decidir se faz agora ou depois |
| **WhatsApp Alerts** | ✅ Pronto | Use para Ana Luiza's achado |
| **Contrato Ana** | ⏳ Pendente | Verificar status (não está em scope desta entrega) |

---

## 6. Próximas Prioridades (Sem Escopo Desta Entrega)

Estas são coisas que você mencionou mas que NÃO foram implementadas nesta sessão:

- [ ] Verificação de contrato ("verifica ok do contrato")
- [ ] Envio automático WhatsApp (por enquanto é manual)
- [ ] Follow-up calls para conversão
- [ ] Integração de cobrança
- [ ] Revisar com tradutor

---

## 7. Dúvidas Comuns

**P: Onde coloco a chave secreta do Vercel?**
R: Não há "chave secreta do Vercel" que você coloque no Lovable/Supabase. Ao invés disso, as variáveis de ambiente vão nas **Settings → Environment Variables** do Vercel (que é onde o código é buildado/deployado).

**P: Preciso de "master login"?**
R: Não! Você já tem acesso ao `/app-cliente-demo` como staff. Se quiser uma experiência mais realista, podemos criar um helper depois.

**P: As 15 telas de governança vão desaparecer?**
R: Não imediatamente. Primeiro você decide se quer arquivá-las (recomendado). Se sim, a próxima semana começa o processo.

---

**Questões?** Releia este documento ou abra um issue no repositório.

_Gerado em 27/08/2026 — Claude Code_
